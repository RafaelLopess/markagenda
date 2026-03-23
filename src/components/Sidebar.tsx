import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Scissors, Users, MessageSquare, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/servicos', icon: Scissors, label: 'Serviços' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
];

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50">
      <div className="p-6 border-b border-border">
        <h1 className="font-display text-2xl font-bold text-gradient-gold">BarberPro</h1>
        <p className="text-muted-foreground text-xs mt-1 font-body">Gestão Inteligente</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary shadow-gold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center">
            <Scissors className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Meu Perfil</p>
            <p className="text-xs text-muted-foreground">Barbeiro</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
