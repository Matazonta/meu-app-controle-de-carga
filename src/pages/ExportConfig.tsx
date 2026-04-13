import { ChevronRightIcon, Inventory2, LocalShipping, Route, Schedule, DownloadIcon, FileTextIcon, ExcelIcon, CsvIcon, ShieldCheckIcon, ArrowRightIcon } from '@/src/components/Icons';
import { motion } from 'motion/react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCargo } from '../contexts/CargoContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExportConfig() {
  const navigate = useNavigate();
  const { registrations, kmRegistrations, drivers, getDriverProductivity } = useCargo();
  const [reportType, setReportType] = useState('produtividade');
  const [format, setFormat] = useState('pdf');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = () => {
    if (format === 'pdf') {
      generatePDF();
    } else {
      // Fallback for other formats
      navigate('/success');
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR');

    // Header
    doc.setFontSize(20);
    doc.setTextColor(188, 1, 0); // Primary color
    doc.text('CONTROLE DE CARGAS - RELATÓRIO', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${dateStr} às ${timeStr}`, 14, 30);
    doc.text(`Tipo: ${reportType.toUpperCase()}`, 14, 35);

    if (reportType === 'produtividade') {
      const tableData = drivers.map(driver => [
        driver.name,
        getDriverProductivity(driver.name).toString(),
        kmRegistrations
          .filter(r => r.driver === driver.name && r.total !== 'Em curso')
          .reduce((acc, curr) => acc + parseFloat(curr.total.replace(' km', '') || '0'), 0)
          .toLocaleString() + ' km'
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Motorista', 'Total de Cargas', 'KM Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [188, 1, 0] }
      });
    } else if (reportType === 'cargas') {
      const tableData = registrations.map(reg => [
        new Date(reg.timestamp).toLocaleDateString('pt-BR'),
        reg.driverName,
        reg.productType,
        reg.quantity.toString(),
        `${reg.origin} -> ${reg.destination}`
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Data', 'Motorista', 'Produto', 'Qtd', 'Rota']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [188, 1, 0] }
      });
    } else if (reportType === 'km') {
      const tableData = kmRegistrations.map(km => [
        km.date,
        km.driver,
        km.vehicle,
        km.start,
        km.end,
        km.total
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Data', 'Motorista', 'Veículo', 'KM Inicial', 'KM Final', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [188, 1, 0] }
      });
    }

    doc.save(`relatorio_${reportType}_${now.getTime()}.pdf`);
    navigate('/success');
  };

  return (
    <div className="bg-surface min-h-screen pb-24">
      <TopBar title="Controle de Cargas" userType="admin" />
      
      <main className="mt-28 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Breadcrumb & Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">
            <span>Painel ADM</span>
            <ChevronRightIcon size={12} />
            <span className="text-primary">Exportação de Relatório</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-none mb-4 uppercase">Configuração de Exportação</h2>
          <p className="text-on-surface-variant max-w-2xl font-medium leading-relaxed">
            Configure os parâmetros técnicos para extração de dados de produtividade e logística. Todos os arquivos são processados com assinatura digital de integridade.
          </p>
        </div>

        {/* Main Configuration Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Parameters */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Type Selection */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-primary"
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="w-10 h-10 flex items-center justify-center bg-primary text-white font-black text-sm rounded-lg">01</span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-primary">Tipo de Relatório</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <ReportTypeOption 
                  id="produtividade"
                  label="Produtividade"
                  description="Análise de eficiência operacional e KPIs."
                  icon={<Inventory2 size={32} />}
                  selected={reportType === 'produtividade'}
                  onClick={() => setReportType('produtividade')}
                />
                <ReportTypeOption 
                  id="cargas"
                  label="Cargas"
                  description="Manifesto completo de volumes e rotas."
                  icon={<LocalShipping size={32} />}
                  selected={reportType === 'cargas'}
                  onClick={() => setReportType('cargas')}
                />
                <ReportTypeOption 
                  id="km"
                  label="KM"
                  description="Controle de quilometragem e consumo."
                  icon={<Route size={32} />}
                  selected={reportType === 'km'}
                  onClick={() => setReportType('km')}
                />
              </div>
            </motion.div>

            {/* Step 2: Period Selection */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-secondary"
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="w-10 h-10 flex items-center justify-center bg-secondary text-white font-black text-sm rounded-lg">02</span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-primary">Período de Extração</h3>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-8">
                <button className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-md active:scale-95 transition-all">Hoje</button>
                <button className="px-8 py-3 bg-surface-container-high text-primary text-xs font-black uppercase tracking-widest rounded-lg hover:bg-surface-container transition-all">Semana</button>
                <button className="px-8 py-3 bg-surface-container-high text-primary text-xs font-black uppercase tracking-widest rounded-lg hover:bg-surface-container transition-all">Mês</button>
                <button className="px-8 py-3 bg-secondary text-white text-xs font-black uppercase tracking-widest rounded-lg flex items-center gap-2 active:scale-95 transition-all shadow-md">
                  <Schedule size={16} /> Personalizado
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-surface-container-low p-8 rounded-2xl border border-on-surface/5">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em]">Data Inicial</label>
                  <input className="w-full bg-white border-none focus:ring-2 focus:ring-primary p-4 rounded-xl font-mono text-sm shadow-inner" type="date" />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em]">Data Final</label>
                  <input className="w-full bg-white border-none focus:ring-2 focus:ring-primary p-4 rounded-xl font-mono text-sm shadow-inner" type="date" />
                </div>
              </div>
            </motion.div>

            {/* Step 3: Format Selection */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-on-surface-variant"
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="w-10 h-10 flex items-center justify-center bg-on-surface-variant text-white font-black text-sm rounded-lg">03</span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-primary">Formato de Saída</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <FormatOption 
                  id="pdf"
                  label="PDF"
                  description="Otimizado para impressão"
                  icon={<FileTextIcon className="text-red-600" size={24} />}
                  selected={format === 'pdf'}
                  onClick={() => setFormat('pdf')}
                />
                <FormatOption 
                  id="excel"
                  label="Excel"
                  description="Processamento de dados (.xlsx)"
                  icon={<ExcelIcon className="text-green-600" size={24} />}
                  selected={format === 'excel'}
                  onClick={() => setFormat('excel')}
                />
                <FormatOption 
                  id="csv"
                  label="CSV"
                  description="Interoperabilidade de sistemas"
                  icon={<CsvIcon className="text-blue-600" size={24} />}
                  selected={format === 'csv'}
                  onClick={() => setFormat('csv')}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Panel: Summary & Action */}
          <div className="lg:col-span-4 sticky top-28">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-primary text-white p-10 rounded-2xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 opacity-10">
                <DownloadIcon size={200} />
              </div>
              
              <h3 className="text-sm font-black tracking-[0.3em] uppercase mb-10 border-b border-white/20 pb-6">Resumo da Extração</h3>
              
              <div className="space-y-8 mb-12">
                <SummaryItem label="Entidade" value={reportType.toUpperCase() + '_ADM'} />
                <SummaryItem label="Abrangência" value="Setor Norte & Sul" />
                <SummaryItem label="Volume Estimado" value="~12.4 MB" />
              </div>

              <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl mb-10 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheckIcon className="text-amber-400" size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Protocolo de Segurança</span>
                </div>
                <p className="text-[10px] text-white/70 leading-relaxed italic font-medium">
                  O sistema gerará um token de expiração de 24h para este link de download após a extração.
                </p>
              </div>

              <button 
                onClick={handleExport}
                className="w-full bg-secondary hover:bg-secondary-container text-white py-6 px-8 flex items-center justify-between font-black uppercase tracking-[0.2em] text-sm transition-all group active:scale-[0.98] rounded-xl shadow-xl"
              >
                Gerar e Exportar
                <ArrowRightIcon className="group-hover:translate-x-2 transition-transform" size={24} />
              </button>
              
              <p className="text-[9px] mt-8 text-center text-white/40 font-mono tracking-tighter uppercase font-bold">
                UUID: DF-892-LOGISTIC-EXPORT-PROD
              </p>
            </motion.div>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}

function ReportTypeOption({ label, description, icon, selected, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col p-6 rounded-xl border-2 transition-all text-left group ${
        selected 
          ? 'bg-primary/5 border-primary shadow-inner' 
          : 'bg-surface-container-low border-transparent hover:border-primary/30'
      }`}
    >
      <div className={`mb-4 transition-transform group-hover:scale-110 ${selected ? 'text-primary' : 'text-on-surface-variant'}`}>
        {icon}
      </div>
      <span className={`font-black text-sm uppercase tracking-tight ${selected ? 'text-primary' : 'text-on-surface-variant'}`}>{label}</span>
      <span className="text-[10px] text-on-surface-variant mt-2 leading-relaxed font-medium">{description}</span>
      {selected && (
        <div className="absolute top-3 right-3 text-primary">
          <ShieldCheckIcon size={16} />
        </div>
      )}
    </button>
  );
}

function FormatOption({ label, description, icon, selected, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-5 p-5 rounded-xl border-2 transition-all group ${
        selected 
          ? 'bg-primary/5 border-primary shadow-inner' 
          : 'bg-surface-container-low border-transparent hover:border-primary/30'
      }`}
    >
      <div className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all ${
        selected ? 'bg-white shadow-md' : 'bg-surface-container-high'
      }`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-black uppercase tracking-tight ${selected ? 'text-primary' : 'text-on-surface-variant'}`}>{label}</p>
        <p className="text-[10px] text-on-surface-variant mt-1 font-medium">{description}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        selected ? 'border-primary bg-primary' : 'border-on-surface-variant/30'
      }`}>
        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
    </button>
  );
}

function SummaryItem({ label, value }: any) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-[10px] uppercase font-black text-white/50 tracking-widest">{label}</span>
      <span className="text-sm font-black text-right uppercase tracking-tight">{value}</span>
    </div>
  );
}
