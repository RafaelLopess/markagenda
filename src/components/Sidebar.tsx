import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Scissors, Users, MessageSquare, Settings, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/servicos', icon: Scissors, label: 'Serviços' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center px-4 z-50 lg:hidden">
        <button onClick={() => setOpen(true)} className="p-2 -ml-2 text-foreground">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="font-display text-xl font-bold text-gradient-gold ml-3">BarberPro</h1>
      </header>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gradient-gold">BarberPro</h1>
            <p className="text-muted-foreground text-xs mt-1 font-body">Gestão Inteligente</p>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setOpen(false)}
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.user_metadata?.name || 'Barbeiro'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button onClick={signOut} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
