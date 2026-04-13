import { Menu, UserCircle, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCargo } from '../contexts/CargoContext';

interface TopBarProps {
  title?: string;
  showMenu?: boolean;
  userType?: 'driver' | 'admin';
}

export default function TopBar({ title = 'Relatórios de Carga', showMenu = true, userType }: TopBarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOffline } = useCargo();

  return (
    <header className="bg-black border-b-4 border-primary flex justify-between items-center w-full px-6 h-20 fixed top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 
            className="font-headline font-bold tracking-tighter uppercase text-white text-xl cursor-pointer leading-none"
            onClick={() => navigate('/')}
          >
            {title}
          </h1>
          {isOffline && (
            <div className="flex items-center gap-1 text-[8px] font-black text-amber-400 uppercase tracking-widest mt-1">
              <WifiOff size={10} /> Modo Offline (Cache Ativo)
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-6">
        {userType === 'admin' && (
          <nav className="hidden md:flex gap-8 items-center">
            <button 
              onClick={() => navigate('/admin/drivers')} 
              className={`font-sans font-semibold text-sm uppercase tracking-wider transition-colors ${window.location.pathname === '/admin/drivers' ? 'text-white underline underline-offset-8 decoration-primary' : 'text-white/70 hover:text-white'}`}
            >
              Frota
            </button>
            <button 
              onClick={() => navigate('/export')} 
              className={`font-sans font-semibold text-sm uppercase tracking-wider transition-colors ${window.location.pathname === '/export' ? 'text-white underline underline-offset-8 decoration-primary' : 'text-white/70 hover:text-white'}`}
            >
              Relatórios
            </button>
            <button 
              onClick={() => {
                if (window.location.pathname !== '/admin/productivity') {
                  navigate('/admin/productivity');
                  setTimeout(() => {
                    const el = document.getElementById('alertas-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  const el = document.getElementById('alertas-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-white/70 font-sans font-semibold text-sm uppercase tracking-wider hover:text-white transition-colors"
            >
              Alertas
            </button>
          </nav>
        )}
        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden sm:block text-xs font-black text-white uppercase tracking-widest">{user.name}</span>
          )}
          <button 
            className="text-white active:scale-[0.98] transition-transform duration-200 ease-in-out p-2 hover:bg-white/10 rounded"
            onClick={() => navigate('/login')}
          >
            <UserCircle size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
