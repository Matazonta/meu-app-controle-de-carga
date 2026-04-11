import { LayoutDashboard, Truck, BarChart3, Bell, ShieldCheck, Gauge } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Painel', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Frota', icon: Truck, path: '/admin/drivers' },
    { label: 'Relatórios', icon: BarChart3, path: '/export' },
    { label: 'Alertas', icon: Bell, path: '#' },
  ];

  // If we are on driver pages, maybe different nav?
  const isDriver = location.pathname.includes('/driver');
  const driverNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/driver/dashboard' },
    { label: 'Carga', icon: Truck, path: '/driver/cargo' },
    { label: 'KM', icon: Gauge, path: '/driver/km' },
    { label: 'Admin', icon: ShieldCheck, path: '/admin/drivers' },
  ];

  const items = isDriver ? driverNavItems : navItems;

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 bg-surface border-t-2 border-secondary/10 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] z-50 md:hidden">
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-4 transition-all duration-200 active:scale-95",
              isActive 
                ? "bg-secondary text-white rounded-md" 
                : "text-secondary/60 dark:text-white/60"
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
