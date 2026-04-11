import { Menu, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  title?: string;
  showMenu?: boolean;
  userType?: 'driver' | 'admin';
}

export default function TopBar({ title = 'Relatórios de Carga', showMenu = true, userType }: TopBarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="bg-[#f4faff] dark:bg-[#111d23] border-b-4 border-secondary-container flex justify-between items-center w-full px-6 h-20 fixed top-0 z-50">
      <div className="flex items-center gap-4">
        {showMenu && (
          <button className="text-secondary dark:text-[#f4faff] active:scale-[0.98] transition-transform duration-200 ease-in-out p-2 hover:bg-secondary/10 rounded">
            <Menu size={24} />
          </button>
        )}
        <h1 
          className="font-headline font-bold tracking-tighter uppercase text-secondary dark:text-[#f4faff] text-xl cursor-pointer"
          onClick={() => navigate('/')}
        >
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex gap-8 items-center">
          <button onClick={() => navigate('/driver/dashboard')} className="text-secondary/70 dark:text-[#f4faff]/70 font-sans font-semibold text-sm uppercase tracking-wider hover:text-primary transition-colors">Painel</button>
          <button className="text-secondary/70 dark:text-[#f4faff]/70 font-sans font-semibold text-sm uppercase tracking-wider hover:text-primary transition-colors">Frota</button>
          <button onClick={() => navigate('/export')} className="text-primary font-bold font-sans text-sm uppercase tracking-wider underline underline-offset-8">Relatórios</button>
          <button className="text-secondary/70 dark:text-[#f4faff]/70 font-sans font-semibold text-sm uppercase tracking-wider hover:text-primary transition-colors">Alertas</button>
        </nav>
        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden sm:block text-xs font-black text-primary uppercase tracking-widest">{user.name}</span>
          )}
          <button 
            className="text-secondary dark:text-[#f4faff] active:scale-[0.98] transition-transform duration-200 ease-in-out p-2 hover:bg-secondary/10 rounded"
            onClick={() => navigate('/login')}
          >
            <UserCircle size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
