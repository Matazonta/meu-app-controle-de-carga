import { Inventory2, Schedule, Route, TrendingUp, TrendingDown, ZapIcon, DownloadIcon } from '@/src/components/Icons';
import { motion } from 'motion/react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useCargo } from '../contexts/CargoContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { registrations, kmRegistrations, getDriverProductivity, drivers, alerts, clearAlerts } = useCargo();

  // Calculate heights based on productivity
  const maxProductivity = Math.max(...drivers.map(d => getDriverProductivity(d.name)), 1);
  
  const sortedDrivers = [...drivers]
    .map(driver => ({
      name: driver.name,
      deliveries: getDriverProductivity(driver.name),
      progress: (getDriverProductivity(driver.name) / maxProductivity) * 100
    }))
    .sort((a, b) => b.deliveries - a.deliveries);

  const totalKm = kmRegistrations.reduce((acc, curr) => {
    if (curr.total !== 'Em curso') {
      const value = parseFloat(curr.total.replace(' km', ''));
      return acc + (isNaN(value) ? 0 : value);
    }
    return acc;
  }, 0);

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
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-1">Fleet Management</p>
            <h1 className="text-5xl font-extrabold tracking-tighter text-primary">Admin Productivity</h1>
          </motion.div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-surface-container-high rounded-xl p-1 shadow-inner">
              <button className="px-6 py-2.5 text-sm font-bold rounded-lg bg-primary text-white shadow-md transition-all">Hoje</button>
              <button className="px-6 py-2.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Semana</button>
              <button className="px-6 py-2.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Mês</button>
            </div>
            <button 
              onClick={() => navigate('/export')}
              className="flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary-container transition-all active:scale-95 shadow-lg"
            >
              <DownloadIcon size={20} />
              Exportar
            </button>
          </div>
        </section>

        {/* Bento Grid KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <KpiCard 
            title="Total Cargas" 
            value={registrations.length.toLocaleString()} 
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

        {/* Main Chart & Sidebar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-on-surface/5"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-primary">Produtividade por Motorista</h2>
              <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                <TrendingUp size={20} className="text-on-surface-variant" />
              </button>
            </div>
            
            {/* Dynamic Bar Chart */}
            <div className="h-72 flex items-end justify-between gap-4 px-2">
              {drivers.map((driver) => {
                const count = getDriverProductivity(driver.name);
                const height = maxProductivity > 0 ? `${(count / maxProductivity) * 100}%` : '5%';
                return (
                  <Bar 
                    key={driver.name} 
                    height={height} 
                    label={driver.name} 
                    active={count > 0} 
                  />
                );
              })}
            </div>
            
            <div className="mt-10 pt-8 border-t border-on-surface/5 flex flex-wrap justify-between gap-4">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded-md shadow-sm"></div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Meta Atingida</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary/20 rounded-md"></div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Em Progresso</span>
                </div>
              </div>
              <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Ver Detalhes do Ranking</button>
            </div>
          </motion.div>

          {/* Alerts & KM History Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Real-time Alerts */}
            <div className="bg-surface-container-low rounded-2xl p-8 border border-on-surface/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold tracking-tight text-primary uppercase">Alertas em Tempo Real</h2>
                <button 
                  onClick={clearAlerts}
                  className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
                >
                  Limpar
                </button>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <motion.div 
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl border-l-4 shadow-sm ${alert.type === 'cargo' ? 'bg-blue-50 border-blue-500' : 'bg-amber-50 border-amber-500'}`}
                    >
                      <p className="text-xs font-bold text-on-surface leading-snug mb-2">{alert.message}</p>
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{alert.timestamp}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-50">Nenhum alerta recente</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fleet Status Summary */}
            <div className="bg-surface-container-low rounded-2xl p-8 border border-on-surface/5">
              <h2 className="text-xl font-bold tracking-tight mb-8 text-primary uppercase">Ranking de Produtividade</h2>
              <div className="space-y-4">
                {sortedDrivers.slice(0, 5).map((driver, index) => (
                  <DriverStatus 
                    key={driver.name}
                    rank={`#${index + 1}`} 
                    name={driver.name} 
                    deliveries={driver.deliveries} 
                    progress={driver.progress || 5} 
                  />
                ))}
              </div>
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
              {kmRegistrations.length > 0 ? (
                kmRegistrations.map((item) => (
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-2 rounded-lg text-white">
                <Inventory2 size={24} />
              </div>
              <h2 className="text-2xl font-extrabold text-primary tracking-tight uppercase">Banco de Dados Geral (Excel)</h2>
            </div>
            <button 
              onClick={() => navigate('/export')}
              className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:underline"
            >
              <DownloadIcon size={16} /> Baixar Planilha Completa
            </button>
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
                  {/* Combine and sort all activities */}
                  {[
                    ...registrations.map(r => ({ ...r, type: 'CARGA', sortDate: r.timestamp })),
                    ...kmRegistrations.map(k => ({ ...k, type: 'KM', sortDate: k.date.split('/').reverse().join('-') + 'T' + k.time }))
                  ]
                  .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
                  .map((activity: any, idx) => (
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
                  {registrations.length === 0 && kmRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant font-medium italic">
                        Nenhum dado registrado no sistema até o momento.
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

function Bar({ height, label, active }: any) {
  return (
    <div className="flex flex-col items-center flex-1 gap-4 h-full">
      <div className="w-full relative flex-1 flex flex-col justify-end">
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`w-full rounded-t-lg shadow-sm ${active ? 'bg-primary' : 'bg-primary/20'}`}
        />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</span>
    </div>
  );
}

function DriverStatus({ rank, name, deliveries, progress }: any) {
  return (
    <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-on-surface/5">
      <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center font-black text-primary text-sm">{rank}</div>
      <div className="flex-1">
        <p className="font-bold text-sm text-primary">{name}</p>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{deliveries} Entregas Concluídas</p>
      </div>
      <div className="w-12 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
        <div className="bg-primary h-full" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
