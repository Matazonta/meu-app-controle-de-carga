import { Inventory2, Route, LocalShipping, AddBox, TrendingUp, TrendingDown, CheckCircle, Warning, Schedule } from '@/src/components/Icons';
import { motion } from 'motion/react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCargo } from '../contexts/CargoContext';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registrations, kmRegistrations } = useCargo();

  const driverName = user?.name || 'João';

  // Calculate cargo today
  const today = new Date().toISOString().split('T')[0];
  const cargasHoje = registrations.filter(r => 
    r.driverName === driverName && 
    r.timestamp.startsWith(today)
  ).length;

  // Calculate total KM
  const kmTotal = kmRegistrations
    .filter(r => r.driver === driverName && r.total !== 'Em curso')
    .reduce((acc, curr) => {
      const value = parseFloat(curr.total.replace(' km', ''));
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

  return (
    <div className="bg-surface min-h-screen pb-24">
      <TopBar title="Controle de Cargas" showMenu={false} />
      
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-8">
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <div className="inline-block bg-surface-container-high px-3 py-1 rounded-full mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Operacional Ativo</span>
          </div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Olá, {driverName}!</h1>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stats Card 1 */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[160px] border border-on-surface/5"
          >
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Cargas hoje</span>
              <Inventory2 className="text-primary" size={24} />
            </div>
            <div>
              <span className="text-5xl font-black text-primary tracking-tighter">{cargasHoje}</span>
              <div className="flex items-center gap-1 mt-1 text-on-surface-variant">
                <TrendingUp size={14} className="text-green-600" />
                <span className="text-[10px] font-bold uppercase">Sincronizado</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Card 2 */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[160px] border border-on-surface/5"
          >
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">KM Percorrido</span>
              <Route className="text-primary" size={24} />
            </div>
            <div>
              <span className="text-5xl font-black text-primary tracking-tighter">{kmTotal.toLocaleString()}</span>
              <span className="text-xl font-bold text-on-surface-variant ml-1">km</span>
            </div>
          </motion.div>

          {/* Quick Action */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/driver/cargo')}
            className="md:col-span-1 group relative overflow-hidden bg-primary p-6 rounded-2xl text-white text-left flex flex-col justify-between min-h-[160px] shadow-lg"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
              <AddBox size={80} />
            </div>
            <LocalShipping size={40} className="text-white" />
            <div>
              <h3 className="text-xl font-bold tracking-tight">Registrar Carga</h3>
              <p className="text-white/70 text-xs mt-1">Clique para iniciar manifesto</p>
            </div>
          </motion.button>

          {/* Odometer Card */}
          <div className="md:col-span-3 bg-surface-container-high p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-extrabold text-primary mb-2">Controle de Odômetro</h3>
              <p className="text-on-surface-variant text-sm">Atualize a quilometragem para cálculo de diária e manutenção preventiva.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => navigate('/driver/km')}
                className="flex-1 md:flex-none h-14 px-6 bg-white text-primary font-bold rounded-xl border border-on-surface/5 hover:bg-surface-container transition-all active:scale-95 shadow-sm"
              >
                Marcar KM Inicial
              </button>
              <button 
                onClick={() => navigate('/driver/km')}
                className="flex-1 md:flex-none h-14 px-6 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-container transition-all active:scale-95 shadow-sm"
              >
                KM Final
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
