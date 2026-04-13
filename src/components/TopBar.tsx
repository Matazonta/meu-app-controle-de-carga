import { Menu, UserCircle, WifiOff, LogOut } from 'lucide-react';
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
  const { user, logout } = useAuth();
  const { isOffline, isSyncing, isBackgroundSyncing } = useCargo();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-black border-b-4 border-primary flex justify-between items-center w-full px-6 h-20 fixed top-0 z-50">
      <div className="flex items-center gap-4">
        {showMenu && (
          <button className="text-white active:scale-[0.98] transition-transform duration-200 ease-in-out p-2 hover:bg-white/10 rounded">
            <Menu size={24} />
          </button>
        )}
        <div className="flex flex-col">
          <h1 
            className="font-headline font-bold tracking-tighter uppercase text-white text-xl cursor-pointer leading-none"
            onClick={() => navigate('/')}
          >
            {title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {!isOffline && (
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSyncing || isBackgroundSyncing ? 'bg-blue-400' : 'bg-green-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isSyncing || isBackgroundSyncing ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                </span>
                <span className={`text-[8px] font-black uppercase tracking-widest ${isSyncing || isBackgroundSyncing ? 'text-blue-400' : 'text-green-400'}`}>
                  {isSyncing || isBackgroundSyncing ? 'Sincronizando...' : 'Sistema Online'}
                </span>
              </div>
            )}
            {isOffline && (
              <div className="flex items-center gap-1 text-[8px] font-black text-amber-400 uppercase tracking-widest">
                <WifiOff size={10} /> Modo Offline (Cache Ativo)
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex gap-8 items-center">
          <button onClick={() => navigate('/admin/drivers')} className="text-white/70 font-sans font-semibold text-sm uppercase tracking-wider hover:text-white transition-colors">Frota</button>
          <button onClick={() => navigate('/export')} className="text-white font-bold font-sans text-sm uppercase tracking-wider underline underline-offset-8 decoration-primary">Relatórios</button>
          <button 
            onClick={() => {
              const el = document.getElementById('alertas-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-white/70 font-sans font-semibold text-sm uppercase tracking-wider hover:text-white transition-colors"
          >
            Alertas
          </button>
        </nav>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex flex-col items-end">
              <span className="hidden sm:block text-[10px] font-black text-white uppercase tracking-widest">{user.name}</span>
              <span className="hidden sm:block text-[8px] font-bold text-primary uppercase tracking-widest">{user.type === 'admin' ? 'Administrador' : 'Motorista'}</span>
            </div>
          )}
          <button 
            className="text-white active:scale-[0.98] transition-transform duration-200 ease-in-out p-2 hover:bg-red-500/20 rounded flex items-center gap-2 group"
            onClick={handleLogout}
            title="Sair do Aplicativo"
          >
            <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
            <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest group-hover:text-red-500 transition-colors">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
