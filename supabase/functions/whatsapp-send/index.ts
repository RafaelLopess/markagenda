import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

type MessageType = 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'cancellation' | 'manual';

interface Payload {
  appointment_id?: string;
  message_type: MessageType;
  resend_id?: string; // whatsapp_messages.id to resend
}

const onlyDigits = (s: string) => (s || '').replace(/\D/g, '');

function formatBrDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function formatTime(t: string) {
  return (t || '').slice(0, 5);
}

function renderTemplate(text: string, vars: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

function templateNameFor(type: MessageType, config: any): string {
  if (type === 'confirmation') return config.template_confirmation_name;
  if (type === 'reminder_24h' || type === 'reminder_2h') return config.template_reminder_name;
  if (type === 'cancellation') return config.template_cancellation_name;
  return '';
}
function templateTextFor(type: MessageType, config: any): string {
  if (type === 'confirmation') return config.template_confirmation_text;
  if (type === 'reminder_24h' || type === 'reminder_2h') return config.template_reminder_text;
  if (type === 'cancellation') return config.template_cancellation_text;
  return '';
}

async function sendToMeta(config: any, toPhone: string, type: MessageType, vars: Record<string, string>) {
  const templateName = templateNameFor(type, config);
  const language = config.template_language || 'pt_BR';
  const url = `https://graph.facebook.com/v20.0/${config.phone_number_id}/messages`;

  // Parameter order used across all templates
  const params = ['nome', 'servico', 'data', 'hora', 'profissional'].map((k) => ({
    type: 'text',
    text: vars[k] ?? '',
  }));

  const body: any = templateName
    ? {
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: language },
          components: [{ type: 'body', parameters: params }],
        },
      }
    : {
        // Fallback: freeform text (only works inside 24h session window)
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'text',
        text: { body: renderTemplate(templateTextFor(type, config), vars) },
      };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  let json: any = {};
  try { json = JSON.parse(raw); } catch { /* ignore */ }
  return { ok: res.ok, status: res.status, json, raw };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimsData.claims.sub;

    const payload = (await req.json()) as Payload;
    if (!payload?.message_type) {
      return new Response(JSON.stringify({ error: 'message_type required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin client (service role) for writes bypassing RLS to touch reminders_sent etc.
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Load config (RLS-scoped via user token)
    const { data: config, error: cfgErr } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (cfgErr) throw cfgErr;
    if (!config || !config.active || !config.phone_number_id || !config.access_token) {
      return new Response(JSON.stringify({ error: 'WhatsApp não configurado ou inativo' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Resolve appointment
    let appointment: any = null;
    let logRow: any = null;
    if (payload.resend_id) {
      const { data: msg } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('id', payload.resend_id)
        .maybeSingle();
      if (!msg) {
        return new Response(JSON.stringify({ error: 'Mensagem não encontrada' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      logRow = msg;
      if (msg.appointment_id) {
        const { data: apt } = await supabase.from('appointments').select('*').eq('id', msg.appointment_id).maybeSingle();
        appointment = apt;
      }
    } else if (payload.appointment_id) {
      const { data: apt } = await supabase.from('appointments').select('*').eq('id', payload.appointment_id).maybeSingle();
      appointment = apt;
    }

    if (!appointment && !logRow) {
      return new Response(JSON.stringify({ error: 'Agendamento não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get professional name from profile
    const { data: profile } = await supabase.from('profiles').select('business_name,name').eq('id', userId).maybeSingle();
    const profissional = profile?.business_name || profile?.name || '';

    const vars = appointment ? {
      nome: appointment.client_name,
      servico: appointment.service_name,
      data: formatBrDate(appointment.date),
      hora: formatTime(appointment.time),
      profissional,
    } : {};

    const toPhone = onlyDigits(appointment?.client_phone || logRow?.to_phone || '');
    if (!toPhone) {
      return new Response(JSON.stringify({ error: 'Telefone do cliente vazio' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rendered = renderTemplate(templateTextFor(payload.message_type, config), vars);

    const result = await sendToMeta(config, toPhone, payload.message_type, vars);

    const waId = result.json?.messages?.[0]?.id ?? null;
    const errText = result.ok ? null : (result.json?.error?.message || result.raw || `HTTP ${result.status}`);

    if (payload.resend_id) {
      await admin.from('whatsapp_messages').update({
        status: result.ok ? 'sent' : 'failed',
        error: errText,
        wa_message_id: waId,
        sent_at: result.ok ? new Date().toISOString() : null,
        rendered_text: rendered,
      }).eq('id', payload.resend_id);
    } else {
      await admin.from('whatsapp_messages').insert({
        user_id: userId,
        appointment_id: appointment?.id ?? null,
        to_phone: toPhone,
        message_type: payload.message_type,
        rendered_text: rendered,
        status: result.ok ? 'sent' : 'failed',
        error: errText,
        wa_message_id: waId,
        sent_at: result.ok ? new Date().toISOString() : null,
      });
    }

    if (!result.ok) {
      return new Response(JSON.stringify({ error: errText, status: result.status, details: result.json }), {
        status: 200, // still 200 so client gets structured error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, wa_message_id: waId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('whatsapp-send error', e);
    return new Response(JSON.stringify({ error: e?.message || 'internal' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
