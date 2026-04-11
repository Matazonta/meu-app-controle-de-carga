import { Truck, User, Lock, ArrowRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCargo } from '../contexts/CargoContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { drivers, updateDriverPassword } = useCargo();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [error, setError] = useState('');

  const handleDriverLogin = () => {
    if (!name.trim() || !password.trim()) {
      setError('Por favor, preencha nome e senha.');
      return;
    }

    const driver = drivers.find(d => d.name.toLowerCase() === name.trim().toLowerCase());

    if (!driver) {
      setError('Motorista não cadastrado. Contate o administrador.');
      return;
    }

    // First access logic: if password is null, set it.
    if (driver.password === null) {
      updateDriverPassword(driver.name, password.trim());
      setError('');
      login(driver.name, 'driver');
      navigate('/driver/dashboard');
    } else {
      // Subsequent access: verify password
      if (driver.password === password.trim()) {
        setError('');
        login(driver.name, 'driver');
        navigate('/driver/dashboard');
      } else {
        setError('Senha incorreta para este motorista.');
      }
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'Pch26') {
      setError('');
      login('Administrador', 'admin');
      navigate('/admin/productivity');
    } else {
      setError('Senha de administrador incorreta.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <div className="bg-primary p-6 rounded-xl shadow-lg mb-8">
          <Truck size={48} className="text-white" />
        </div>

        <h1 className="text-3xl font-black text-primary tracking-tighter uppercase mb-2 text-center">Controle de Cargas</h1>
        
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">
            {showAdminLogin ? 'Acesso Administrativo' : 'Bem-vindo, Motorista'}
          </h2>
          <p className="text-on-surface-variant font-medium">
            {showAdminLogin ? 'Área restrita para gestão e relatórios.' : 'Acesse sua escala de entregas e rotas do dia.'}
          </p>
        </div>

        <div className="w-full space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-100 text-red-700 p-4 rounded-xl text-xs font-bold text-center border border-red-200"
            >
              {error}
            </motion.div>
          )}

          {!showAdminLogin ? (
            <>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nome do Motorista</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                  <input 
                    type="text" 
                    placeholder="Digite seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-16 pl-12 pr-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Senha</label>
                  <button className="text-xs font-bold text-primary hover:underline">Esqueci minha senha</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-16 pl-12 pr-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                onClick={handleDriverLogin}
                className="w-full h-16 bg-primary text-white rounded-xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-container transition-all active:scale-[0.98] shadow-lg"
              >
                Entrar <ArrowRight size={24} />
              </button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Senha do Administrador</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                  <input 
                    type="password" 
                    placeholder="Digite a senha mestra"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full h-16 pl-12 pr-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                onClick={handleAdminLogin}
                className="w-full h-16 bg-on-surface text-white rounded-xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-on-surface/90 transition-all active:scale-[0.98] shadow-lg"
              >
                Validar Acesso <ArrowRight size={24} />
              </button>

              <button 
                onClick={() => {
                  setShowAdminLogin(false);
                  setError('');
                }}
                className="w-full text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
              >
                Voltar para Login de Motorista
              </button>
            </>
          )}

          {!showAdminLogin && (
            <>
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-on-surface-variant/20"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">ou</span>
                <div className="flex-grow border-t border-on-surface-variant/20"></div>
              </div>

              <button 
                onClick={() => {
                  setShowAdminLogin(true);
                  setError('');
                }}
                className="w-full h-16 border-2 border-on-surface text-on-surface rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-on-surface/5 transition-all active:scale-[0.98]"
              >
                <ShieldCheck size={24} /> Acesso de Administrador
              </button>
            </>
          )}

          <div className="flex items-start gap-3 p-4">
            <Info size={18} className="text-on-surface-variant mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Problemas com o acesso? Entre em contato com o suporte central.
            </p>
          </div>
        </div>

        <footer className="mt-12 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-50">
          © 2023 Controle de Cargas Systems V4.2.0
        </footer>
      </motion.div>
    </div>
  );
}

function ShieldCheck({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
