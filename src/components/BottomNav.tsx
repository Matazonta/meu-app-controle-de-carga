import { LayoutDashboard, Truck, BarChart3, Bell, ShieldCheck, Gauge, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Painel', icon: LayoutDashboard, path: '/admin/productivity' },
    { label: 'Frota', icon: Truck, path: '/admin/drivers' },
    { label: 'Alertas', icon: Bell, path: '#' },
    { label: 'Sair', icon: LogOut, path: '/login' },
  ];

  // If we are on driver pages, maybe different nav?
  const isDriver = location.pathname.includes('/driver');
  const driverNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/driver/dashboard' },
    { label: 'Carga', icon: Truck, path: '/driver/cargo' },
    { label: 'KM', icon: Gauge, path: '/driver/km' },
    { label: 'Sair', icon: LogOut, path: '/login' },
  ];

  const items = isDriver ? driverNavItems : navItems;

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 bg-black border-t-2 border-primary/20 shadow-[0_-4px_20px_0_rgba(0,0,0,0.2)] z-50 md:hidden">
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            onClick={() => {
              if (item.label === 'Alertas') {
                if (location.pathname !== '/admin/productivity') {
                  navigate('/admin/productivity');
                  setTimeout(() => {
                    const el = document.getElementById('alertas-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  const el = document.getElementById('alertas-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              } else if (item.label === 'Sair') {
                logout();
                navigate('/login');
              } else {
                navigate(item.path);
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-4 transition-all duration-200 active:scale-95",
              isActive 
                ? "bg-primary text-white rounded-md" 
                : "text-white/60"
            )}
          >
            <Icon size={20} />
            <span className="font-sans font-semibold text-[10px] uppercase tracking-wider mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
