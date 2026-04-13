import React from 'react';
import { Inventory2, Route, TrendingUp, TrendingDown, DownloadIcon, ZapIcon } from '@/src/components/Icons';
import { motion } from 'motion/react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useCargo } from '../contexts/CargoContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { registrations, kmRegistrations, getDriverProductivity, drivers, alerts, clearAlerts, resetDailyData, hardResetDatabase } = useCargo();
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const [showHardResetConfirm, setShowHardResetConfirm] = React.useState(false);
  const [lastAlertCount, setLastAlertCount] = React.useState(alerts.length);
  const [shouldPulse, setShouldPulse] = React.useState(false);

  React.useEffect(() => {
    if (alerts.length > lastAlertCount) {
      setShouldPulse(true);
      const timer = setTimeout(() => setShouldPulse(false), 2000);
      return () => clearTimeout(timer);
    }
    setLastAlertCount(alerts.length);
  }, [alerts.length, lastAlertCount]);

  const handleReset = () => {
    resetDailyData();
    setShowResetConfirm(false);
  };

  const handleHardReset = () => {
    hardResetDatabase();
    setShowHardResetConfirm(false);
  };

  const [filterDriver, setFilterDriver] = React.useState('Todos');
  const [filterType, setFilterType] = React.useState('Todos');
  const [timeFilter, setTimeFilter] = React.useState<'Hoje' | 'Semana' | 'Mês'>('Hoje');

  const filteredRegistrations = React.useMemo(() => {
    return registrations.filter(reg => {
      const regDate = new Date(reg.timestamp);
      const now = new Date();
      if (timeFilter === 'Hoje') {
        return regDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'Semana') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return regDate >= weekAgo;
      } else {
        return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
      }
    });
  }, [registrations, timeFilter]);

  const filteredKmRegistrations = React.useMemo(() => {
    return kmRegistrations.filter(km => {
      const [day, month, year] = km.date.split('/').map(Number);
      const kmDate = new Date(year, month - 1, day);
      const now = new Date();
      if (timeFilter === 'Hoje') {
        return kmDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'Semana') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return kmDate >= weekAgo;
      } else {
        return kmDate.getMonth() === now.getMonth() && kmDate.getFullYear() === now.getFullYear();
      }
    });
  }, [kmRegistrations, timeFilter]);

  // Calculate heights based on productivity
  const getLocalDriverProductivity = (driverName: string) => {
    return filteredRegistrations.filter((r) => r.driverName.toLowerCase() === driverName.toLowerCase()).length;
  };

  const maxProductivity = Math.max(...drivers.map(d => getLocalDriverProductivity(d.name)), 1);
  
  const sortedDrivers = [...drivers]
    .map(driver => ({
      name: driver.name,
      deliveries: getLocalDriverProductivity(driver.name),
      progress: (getLocalDriverProductivity(driver.name) / maxProductivity) * 100
    }))
    .sort((a, b) => b.deliveries - a.deliveries);

  const totalKm = filteredKmRegistrations.reduce((acc, curr) => {
    if (curr.total !== 'Em curso') {
      const value = parseFloat(curr.total.replace(' km', ''));
      return acc + (isNaN(value) ? 0 : value);
    }
    return acc;
  }, 0);

  const allActivities = [
    ...filteredRegistrations.map(r => ({ ...r, type: 'CARGA', sortDate: r.timestamp })),
    ...filteredKmRegistrations.map(k => ({ ...k, type: 'KM', sortDate: k.date.split('/').reverse().join('-') + 'T' + k.time }))
  ]
  .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
  .filter(activity => {
    const driverMatch = filterDriver === 'Todos' || (activity.type === 'CARGA' ? activity.driverName : activity.driver) === filterDriver;
    const typeMatch = filterType === 'Todos' || activity.type === filterType;
    return driverMatch && typeMatch;
  });

  return (
    <div className="bg-surface min-h-screen pb-24 md:pb-0">
      <TopBar title="Controle de Cargas" userType="admin" />
      
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-8">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-extrabold tracking-tighter text-primary">Monitoramento Geral</h1>
            <p className="text-on-surface-variant font-medium mt-2">Dados de produtividade e quilometragem em tempo real.</p>
          </motion.div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-surface-container-high rounded-xl p-1 shadow-inner">
              <button 
                onClick={() => setTimeFilter('Hoje')}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${timeFilter === 'Hoje' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Hoje
              </button>
              <button 
                onClick={() => setTimeFilter('Semana')}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${timeFilter === 'Semana' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Semana
              </button>
              <button 
                onClick={() => setTimeFilter('Mês')}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${timeFilter === 'Mês' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Mês
              </button>
            </div>
            <button 
              onClick={() => navigate('/export')}
              className="flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary-container transition-all active:scale-95 shadow-lg"
            >
              <DownloadIcon size={20} />
              Exportar
            </button>
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-all active:scale-95 shadow-lg"
            >
              <ZapIcon size={20} />
              Reset Diário
            </button>
            <button 
              onClick={() => setShowHardResetConfirm(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg"
            >
              <ZapIcon size={20} />
              Reset Total
            </button>
          </div>
        </section>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-on-surface/10"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <ZapIcon size={32} />
              </div>
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight mb-4">Confirmar Reset Diário?</h3>
              <p className="text-on-surface-variant font-medium mb-8 leading-relaxed">
                Isso irá limpar o <span className="font-bold text-primary">Histórico de KM</span> e os <span className="font-bold text-primary">Alertas</span> para iniciar um novo dia. 
                <br/><br/>
                <span className="text-green-600 font-bold">O histórico de cargas será mantido</span> para sua análise semanal de produtividade.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-4 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-container transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleReset}
                  className="flex-1 py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg"
                >
                  Confirmar Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Hard Reset Confirmation Modal */}
        {showHardResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-on-surface/10"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <ZapIcon size={32} />
              </div>
              <h3 className="text-2xl font-black text-red-600 uppercase tracking-tight mb-4">RESET TOTAL DO SISTEMA</h3>
              <p className="text-on-surface-variant font-medium mb-8 leading-relaxed">
                <span className="text-red-600 font-black uppercase">Atenção:</span> Esta ação é irreversível. 
                <br/><br/>
                Todos os dados de <span className="font-bold text-primary">Cargas</span>, <span className="font-bold text-primary">KM</span> e <span className="font-bold text-primary">Alertas</span> serão excluídos permanentemente do banco de dados para liberar espaço.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowHardResetConfirm(false)}
                  className="flex-1 py-4 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-container transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleHardReset}
                  className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg"
                >
                  LIMPAR TUDO
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bento Grid KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <KpiCard 
            title="Total Cargas" 
            value={filteredRegistrations.length.toLocaleString()} 
            trend="+12%" 
            icon={<Inventory2 size={24} />} 
            isPositive={true} 
          />
          <KpiCard 
            title="Distância Total" 
            value={totalKm.toLocaleString()} 
            unit="km" 
            trend="+8%" 
            icon={<Route size={24} />} 
            isPositive={true} 
          />
        </section>

        {/* Main Productivity & Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-on-surface/5"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-primary">Ranking de Produtividade</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Meta: 10/dia</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {sortedDrivers.map((driver, index) => {
                const driverKm = filteredKmRegistrations
                  .filter(r => r.driver === driver.name && r.total !== 'Em curso')
                  .reduce((acc, curr) => {
                    const value = parseFloat(curr.total.replace(' km', ''));
                    return acc + (isNaN(value) ? 0 : value);
                  }, 0);

                return (
                  <div key={driver.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${index < 3 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                          {index + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{driver.name}</span>
                          <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">{driverKm.toLocaleString()} KM Percorridos</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-primary">{driver.deliveries} <span className="text-[10px] text-on-surface-variant uppercase">Cargas</span></span>
                        <span className="text-[10px] font-bold text-on-surface-variant">{Math.round(driver.progress)}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden border border-on-surface/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${driver.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${index === 0 ? 'bg-primary shadow-[0_0_10px_rgba(188,1,0,0.3)]' : 'bg-primary/60'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-10 pt-8 border-t border-on-surface/5 flex flex-wrap justify-between gap-4">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded-md shadow-sm"></div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Líder</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary/60 rounded-md"></div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Operacional</span>
                </div>
              </div>
              <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Ver Relatório Completo</button>
            </div>
          </motion.div>

          {/* Alerts Sidebar */}
          <div 
            id="alertas-section" 
            className={`bg-surface-container-low rounded-2xl p-8 border border-on-surface/5 transition-all duration-500 ${shouldPulse ? 'ring-4 ring-primary/30 bg-primary/5' : ''}`}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tight text-primary uppercase">Alertas Recentes</h2>
              <button 
                onClick={clearAlerts}
                className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
              >
                Limpar
              </button>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <motion.div 
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border-l-4 shadow-sm ${alert.type === 'cargo' ? 'bg-blue-50 border-blue-500' : 'bg-amber-50 border-amber-500'}`}
                  >
                    <p className="text-xs font-bold text-on-surface leading-snug mb-2">{alert.message}</p>
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                      {new Date(alert.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-50">Nenhum alerta recente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KM History Section (Admin Only) */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-primary tracking-tight uppercase">Histórico de Quilometragem</h2>
          </div>
          
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-on-surface/5">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-surface-container-low font-sans text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              <div className="col-span-4">Data / Hora / Motorista</div>
              <div className="col-span-3 text-center">KM Inicial</div>
              <div className="col-span-3 text-center">KM Final</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            <div className="flex flex-col divide-y divide-on-surface/5">
              {filteredKmRegistrations.length > 0 ? (
                filteredKmRegistrations.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-surface-container-low transition-colors">
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-primary">{item.date}</p>
                        <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded font-bold text-on-surface-variant">{item.time}</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1">Motorista: {item.driver}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Veículo: {item.vehicle}</p>
                    </div>
                    <div className="col-span-3 text-center font-headline font-bold text-on-surface">{item.start}</div>
                    <div className="col-span-3 text-center font-headline font-bold text-on-surface">{item.end}</div>
                    <div className="col-span-2 text-right">
                      <span className={`px-3 py-1 rounded-full font-bold text-xs whitespace-nowrap ${item.total === 'Em curso' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                        {item.total}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-on-surface-variant font-medium">Nenhum registro de KM encontrado.</div>
              )}
            </div>
          </div>
        </section>

        {/* Unified Activity Database (Excel-like) */}
        <section className="mt-12 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-2 rounded-lg text-white">
                <Inventory2 size={24} />
              </div>
              <h2 className="text-2xl font-extrabold text-primary tracking-tight uppercase">Banco de Dados Geral</h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-on-surface/10 shadow-sm">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Motorista:</span>
                <select 
                  value={filterDriver}
                  onChange={(e) => setFilterDriver(e.target.value)}
                  className="text-xs font-bold text-primary bg-transparent border-none focus:ring-0 cursor-pointer"
                >
                  <option value="Todos">Todos</option>
                  {drivers.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-on-surface/10 shadow-sm">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Tipo:</span>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-xs font-bold text-primary bg-transparent border-none focus:ring-0 cursor-pointer"
                >
                  <option value="Todos">Todos</option>
                  <option value="CARGA">Carga</option>
                  <option value="KM">KM</option>
                </select>
              </div>

              <button 
                onClick={() => navigate('/export')}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-container transition-all shadow-md"
              >
                <DownloadIcon size={16} /> Exportar
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-on-surface/10 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary text-white font-sans text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-6 py-5 border-r border-white/10">Data / Hora</th>
                    <th className="px-6 py-5 border-r border-white/10">Motorista</th>
                    <th className="px-6 py-5 border-r border-white/10">Tipo</th>
                    <th className="px-6 py-5 border-r border-white/10">Registro de Carga (Origem/Destino/Produto)</th>
                    <th className="px-6 py-5 border-r border-white/10 text-center">KM Inicial</th>
                    <th className="px-6 py-5 border-r border-white/10 text-center">KM Final</th>
                    <th className="px-6 py-5 text-right">Total / Qtd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-on-surface/5">
                  {allActivities.map((activity: any, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-4 border-r border-on-surface/5">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary text-sm">
                            {activity.type === 'CARGA' ? new Date(activity.timestamp).toLocaleDateString('pt-BR') : activity.date}
                          </span>
                          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                            {activity.type === 'CARGA' ? new Date(activity.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : activity.time}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-on-surface/5">
                        <span className="font-black text-xs uppercase tracking-tight text-on-surface">
                          {activity.type === 'CARGA' ? activity.driverName : activity.driver}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-on-surface/5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          activity.type === 'CARGA' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-on-surface/5">
                        {activity.type === 'CARGA' ? (
                          <div className="text-xs font-medium text-on-surface-variant">
                            <p><span className="font-bold text-primary">PROD:</span> {activity.productType}</p>
                            <p><span className="font-bold text-primary">ROTA:</span> {activity.origin} → {activity.destination}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-on-surface-variant italic">N/A (Registro de KM)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 border-r border-on-surface/5 text-center font-mono text-xs font-bold">
                        {activity.type === 'KM' ? activity.start : '-'}
                      </td>
                      <td className="px-6 py-4 border-r border-on-surface/5 text-center font-mono text-xs font-bold">
                        {activity.type === 'KM' ? activity.end : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-sm text-primary">
                          {activity.type === 'CARGA' ? `${activity.quantity} un` : activity.total}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {allActivities.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant font-medium italic">
                        Nenhum dado encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
}

function KpiCard({ title, value, unit, trend, icon, isPositive }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-8 rounded-2xl flex flex-col justify-between min-h-[180px] relative overflow-hidden group shadow-sm border border-on-surface/5"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
      <div className="relative z-10">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-on-surface-variant">{title}</h3>
      </div>
      <div className="flex items-baseline gap-2 mt-4 relative z-10">
        <span className="text-5xl font-black tracking-tight text-primary">{value}</span>
        {unit && <span className="text-2xl font-bold text-on-surface-variant">{unit}</span>}
        <span className={`font-bold text-xs px-2 py-1 rounded-full flex items-center gap-1 ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </span>
      </div>
    </motion.div>
  );
}

