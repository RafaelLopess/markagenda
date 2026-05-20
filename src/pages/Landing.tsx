import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Scissors,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Calendar, title: 'Agenda inteligente', desc: 'Veja todos os atendimentos do dia em segundos. Crie, edite e cancele com um clique.' },
  { icon: MessageSquare, title: 'WhatsApp automático', desc: 'Confirmações e lembretes enviados sozinhos. Reduza faltas e remarcações.' },
  { icon: TrendingUp, title: 'Faturamento em tempo real', desc: 'Saiba quanto você faturou hoje, na semana e no mês. Sem planilha.' },
  { icon: Users, title: 'Cadastro de clientes e pacientes', desc: 'Histórico completo de cada pessoa, serviços realizados e total gasto.' },
  { icon: Scissors, title: 'Catálogo de serviços', desc: 'Cadastre seus serviços ou procedimentos com preço e duração.' },
  { icon: Clock, title: 'Economize horas por dia', desc: 'Pare de responder WhatsApp manualmente. Foque no atendimento.' },
];

const plans = [
  {
    name: 'Básico',
    price: 39,
    desc: 'Para quem está começando a organizar a agenda.',
    features: [
      'Agenda online ilimitada',
      'Cadastro de clientes e serviços',
      'Dashboard de faturamento',
      'Suporte por e-mail',
    ],
    highlight: false,
    cta: 'Começar com Básico',
  },
  {
    name: 'Pro',
    price: 79,
    desc: 'O plano completo. Para quem quer crescer.',
    features: [
      'Tudo do Básico, mais:',
      'WhatsApp automático (confirmações + lembretes)',
      'Página pública de agendamento',
      'Relatórios avançados de faturamento',
      'Suporte prioritário',
    ],
    highlight: true,
    cta: 'Assinar plano Pro',
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Logo className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-gradient-gold">MarkAgenda</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#recursos" className="hover:text-primary transition-colors">Recursos</a>
            <a href="#planos" className="hover:text-primary transition-colors">Planos</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </div>
          <Link to="/app">
            <Button variant="ghost" size="sm" className="text-foreground">Entrar</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground mb-8"
          >
            <Zap className="w-4 h-4 text-primary" />
            Gestão completa para barbearias e clínicas
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Sua agenda <br />
            <span className="text-gradient-gold">profissional como nunca.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Agenda inteligente, confirmação automática no WhatsApp e relatórios de faturamento para barbearias e clínicas. Tudo num só lugar, sem planilha e sem complicação.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/app">
              <Button
                size="lg"
                className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90 px-8 h-12"
              >
                Começar agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#planos">
              <Button size="lg" variant="outline" className="border-border h-12 px-8">
                Ver planos
              </Button>
            </a>
          </motion.div>

          <p className="text-sm text-muted-foreground mt-6">
            Sem cartão para começar · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-20 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Tudo o que você precisa <span className="text-gradient-gold">num lugar só</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pare de perder tempo (e dinheiro) com WhatsApp e caderninho. Centralize seu atendimento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6 shadow-card hover:border-primary/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Escolha seu <span className="text-gradient-gold">plano</span>
            </h2>
            <p className="text-muted-foreground">Sem letras miúdas. Cancele quando quiser.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative bg-card rounded-2xl p-8 shadow-card border-2 ${
                  p.highlight ? 'border-primary shadow-gold' : 'border-border'
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{p.desc}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold">R$ {p.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/app" className="block">
                  <Button
                    className={`w-full h-11 ${
                      p.highlight
                        ? 'bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {p.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Perguntas <span className="text-gradient-gold">frequentes</span>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Serve para barbearia e para clínica?', a: 'Sim. O MarkAgenda foi feito para qualquer profissional que trabalha com hora marcada — barbearias, clínicas, estética, terapias e consultórios.' },
              { q: 'Preciso saber mexer com tecnologia?', a: 'Não. O MarkAgenda foi feito para ser usado direto do celular, sem treinamento. Se você usa WhatsApp, consegue usar.' },
              { q: 'Posso cancelar quando quiser?', a: 'Sim. A assinatura é mensal e você cancela a qualquer momento direto no painel. Sem multa, sem fidelidade.' },
              { q: 'Meus clientes precisam baixar algum app?', a: 'Não. Eles agendam pelo seu link público (no plano Pro) ou recebem confirmação direto no WhatsApp.' },
              { q: 'Como funciona o pagamento?', a: 'Cobrança mensal automática no cartão de crédito. Você recebe nota fiscal por e-mail.' },
            ].map((item) => (
              <div key={item.q} className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Pronto pra <span className="text-gradient-gold">profissionalizar</span> seu atendimento?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Junte-se aos profissionais que pararam de perder cliente por desorganização.
          </p>
          <Link to="/app">
            <Button
              size="lg"
              className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90 px-10 h-12"
            >
              Criar minha conta grátis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Logo className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">MarkAgenda</span>
          </div>
          <p>© {new Date().getFullYear()} MarkAgenda. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
