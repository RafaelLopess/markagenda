import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const onlyDigits = (s: string) => (s || '').replace(/\D/g, '');
const formatBrDate = (iso: string) => { const [y,m,d]=iso.split('-'); return `${d}/${m}/${y}`; };
const formatTime = (t: string) => (t || '').slice(0, 5);
const renderTemplate = (text: string, vars: Record<string,string>) =>
  text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

async function sendMeta(config: any, toPhone: string, type: 'reminder_24h'|'reminder_2h', vars: Record<string,string>) {
  const url = `https://graph.facebook.com/v20.0/${config.phone_number_id}/messages`;
  const params = ['nome','servico','data','hora','profissional'].map(k => ({ type: 'text', text: vars[k] ?? '' }));
  const body = config.template_reminder_name ? {
    messaging_product: 'whatsapp',
    to: toPhone,
    type: 'template',
    template: {
      name: config.template_reminder_name,
      language: { code: config.template_language || 'pt_BR' },
      components: [{ type: 'body', parameters: params }],
    },
  } : {
    messaging_product: 'whatsapp',
    to: toPhone,
    type: 'text',
    text: { body: renderTemplate(config.template_reminder_text, vars) },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let json: any = {}; try { json = JSON.parse(raw); } catch {}
  return { ok: res.ok, status: res.status, json, raw };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Shared secret auth
  const secret = req.headers.get('x-cron-secret');
  if (!secret || secret !== Deno.env.get('WHATSAPP_CRON_TOKEN')) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const now = new Date();

  const { data: configs, error: cErr } = await admin
    .from('whatsapp_config').select('*').eq('active', true);
  if (cErr) return new Response(JSON.stringify({ error: cErr.message }), { status: 500, headers: corsHeaders });

  const summary: any[] = [];

  for (const config of configs || []) {
    if (!config.phone_number_id || !config.access_token) continue;
    const hours: number[] = (config.reminder_hours && config.reminder_hours.length) ? config.reminder_hours : [24, 2];

    // Get all future appointments for this user in the next 25h with pending/confirmed status
    const { data: appts } = await admin
      .from('appointments')
      .select('*')
      .eq('user_id', config.user_id)
      .in('status', ['pending', 'confirmed'])
      .gte('date', now.toISOString().slice(0,10));

    if (!appts) continue;

    const { data: profile } = await admin.from('profiles').select('business_name,name').eq('id', config.user_id).maybeSingle();
    const profissional = profile?.business_name || profile?.name || '';

    for (const apt of appts) {
      const aptDate = new Date(`${apt.date}T${apt.time}`);
      const diffH = (aptDate.getTime() - now.getTime()) / 3_600_000;
      if (diffH < 0) continue;

      for (const h of hours) {
        // Trigger window: within 30min AFTER the target time (i.e. hours remaining <= h)
        // but not too early: only when diffH <= h and > (h - 0.5)
        if (diffH <= h && diffH > h - 0.5) {
          const key = `reminder_${h}h`;
          if ((apt.reminders_sent || []).includes(key)) continue;

          const toPhone = onlyDigits(apt.client_phone);
          if (!toPhone) continue;

          const vars = {
            nome: apt.client_name,
            servico: apt.service_name,
            data: formatBrDate(apt.date),
            hora: formatTime(apt.time),
            profissional,
          };
          const rendered = renderTemplate(config.template_reminder_text, vars);
          const type = h >= 24 ? 'reminder_24h' : 'reminder_2h';
          const result = await sendMeta(config, toPhone, type, vars);
          const waId = result.json?.messages?.[0]?.id ?? null;
          const errText = result.ok ? null : (result.json?.error?.message || result.raw || `HTTP ${result.status}`);

          await admin.from('whatsapp_messages').insert({
            user_id: config.user_id,
            appointment_id: apt.id,
            to_phone: toPhone,
            message_type: type,
            rendered_text: rendered,
            status: result.ok ? 'sent' : 'failed',
            error: errText,
            wa_message_id: waId,
            sent_at: result.ok ? new Date().toISOString() : null,
          });

          if (result.ok) {
            await admin.from('appointments').update({
              reminders_sent: [...(apt.reminders_sent || []), key],
            }).eq('id', apt.id);
          }
          summary.push({ apt: apt.id, h, ok: result.ok });
        }
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: summary.length, summary }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
