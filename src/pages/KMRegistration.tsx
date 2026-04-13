import { SaveIcon, TrendingUp, SpeedometerIcon, MapPinIcon, ChevronRightIcon } from '@/src/components/Icons';
import { motion } from 'motion/react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCargo } from '../contexts/CargoContext';
import { useState } from 'react';

export default function KMRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { kmRegistrations, addKMRegistration, updateKMRegistration } = useCargo();
  const [activeTab, setActiveTab] = useState<'inicial' | 'final'>('inicial');
  const [kmValue, setKmValue] = useState('');

  const driverKm = kmRegistrations
    .filter(r => r.driver === (user?.name || 'João') && r.total !== 'Em curso')
    .reduce((acc, curr) => {
      const value = parseFloat(curr.total.replace(' km', ''));
      return acc + (isNaN(value) ? 0 : value);
    }, 0);

  const estimatedDiesel = (driverKm / 2.8).toFixed(1);

  const handleConfirm = () => {
    if (!kmValue) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (activeTab === 'inicial') {
      const newEntry = {
        date: dateStr,
        time: timeStr,
        vehicle: 'SC-4592',
        driver: user?.name || 'Motorista',
        start: kmValue,
        end: '---',
        total: 'Em curso'
      };
      addKMRegistration(newEntry);
      setActiveTab('final');
      setKmValue('');
    } else {
      // Find the most recent entry for this vehicle/driver that doesn't have an end KM
      const entry = kmRegistrations.find(e => e.end === '---' && e.driver === (user?.name || 'Motorista'));
      
      if (entry) {
        const startKm = parseFloat(entry.start.replace('.', ''));
        const endKm = parseFloat(kmValue.replace('.', ''));
        const total = endKm - startKm;

        const updatedEntry = {
          ...entry,
          end: kmValue,
          total: `${total > 0 ? total : 0} km`
        };
        updateKMRegistration(updatedEntry);
        setActiveTab('inicial');
        setKmValue('');
      }
    }
  };

  return (
    <div className="bg-surface min-h-screen pb-24">
      <TopBar title="Controle de Cargas" showMenu={false} />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-28 pb-8">
        {/* Hero Section: KM Entry */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Panel: Input Control */}
          <div className="lg:col-span-12 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-on-surface/5"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-2xl font-extrabold text-primary tracking-tight">Registro de Quilometragem</h2>
                <div className="bg-surface-container-high p-1 rounded-lg flex">
                  <button 
                    onClick={() => setActiveTab('inicial')}
                    className={`px-4 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'inicial' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    KM Inicial
                  </button>
                  <button 
                    onClick={() => setActiveTab('final')}
                    className={`px-4 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === 'final' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    KM Final
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mb-10">
                <label className="font-sans text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Leitura do Odômetro ({activeTab === 'inicial' ? 'Início do Dia' : 'Fim do Dia'})
                </label>
                <div className="relative group">
                  <input 
                    type="number" 
                    placeholder="000.000"
                    value={kmValue}
                    onChange={(e) => setKmValue(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl text-6xl font-black font-headline p-8 text-primary focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-surface-dim"
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-primary/40 font-black text-2xl font-headline">KM</div>
                </div>
              </div>

              <button 
                onClick={handleConfirm}
                className="w-full bg-primary text-white h-16 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary-container active:scale-[0.98] transition-all shadow-lg"
              >
                <SaveIcon size={24} /> Confirmar Registro {activeTab === 'inicial' ? 'Inicial' : 'Final'}
              </button>
            </motion.div>

            {/* Bento Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary text-white p-6 rounded-2xl flex flex-col justify-between shadow-md">
                <span className="font-sans text-xs font-medium uppercase tracking-widest text-white/60">Total Percorrido</span>
                <div className="mt-4">
                  <span className="text-4xl font-black font-headline">{driverKm.toLocaleString()}</span>
                  <span className="text-lg font-bold ml-1">km</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-white/60">
                  <TrendingUp size={14} />
                  <span>Sincronizado</span>
                </div>
              </div>
              <div className="bg-surface-container-high p-6 rounded-2xl text-primary flex flex-col justify-between border border-on-surface/5">
                <span className="font-sans text-xs font-medium uppercase tracking-widest text-on-surface-variant">Consumo Estimado</span>
                <div className="mt-4">
                  <span className="text-4xl font-black font-headline">{estimatedDiesel}</span>
                  <span className="text-lg font-bold ml-1">L</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-on-surface-variant">
                  <SpeedometerIcon size={14} />
                  <span>Diesel S10</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
}
