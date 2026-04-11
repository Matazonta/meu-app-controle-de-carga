import { VerifiedIcon, CheckCircle, FileTextIcon, ShareIcon, Inventory2, MenuIcon, UserCircleIcon } from '@/src/components/Icons';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function SuccessScreen() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="bg-[#f4faff] dark:bg-[#111d23] border-b-4 border-secondary-container flex justify-between items-center w-full px-6 h-20 fixed top-0 z-50">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-secondary/10 active:scale-[0.98] transition-transform duration-200 rounded-lg">
            <MenuIcon className="text-secondary dark:text-[#f4faff]" size={24} />
          </button>
          <h1 className="text-secondary dark:text-[#f4faff] font-headline font-bold tracking-tighter uppercase text-xl">Relatórios de Carga</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-secondary/10 active:scale-[0.98] transition-transform duration-200 rounded-lg">
            <UserCircleIcon className="text-secondary dark:text-[#f4faff]" size={24} />
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center pt-20 pb-20 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden rounded-3xl shadow-2xl border border-on-surface/5"
        >
          {/* Left Side: Visual Anchor */}
          <div className="md:col-span-5 bg-gradient-to-br from-secondary to-secondary-container p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-1.5 bg-primary mb-8 rounded-full"
              />
              <h2 className="font-headline font-black text-5xl text-white tracking-tighter leading-[0.9] mb-6 uppercase">
                Operação<br/>Concluída
              </h2>
              <p className="text-white/80 font-medium text-lg leading-relaxed">
                O processamento dos dados logísticos foi finalizado e o manifesto digital está pronto para distribuição.
              </p>
            </div>
            
            <div className="mt-12 relative z-10">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <VerifiedIcon className="text-primary" size={20} />
                  <span className="text-white font-black text-xs tracking-[0.2em] uppercase">Status do Sistema</span>
                </div>
                <div className="text-white/60 text-[10px] font-black uppercase tracking-widest">Sincronizado com o terminal principal</div>
              </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
              <Inventory2 className="text-white" size={400} />
            </div>
          </div>

          {/* Right Side: Interaction Hub */}
          <div className="md:col-span-7 bg-white p-10 md:p-16 flex flex-col justify-center">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              {/* Success Indicator */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-10 shadow-inner"
              >
                <CheckCircle className="text-primary" size={56} />
              </motion.div>
              
              <h3 className="font-headline font-black text-4xl text-primary mb-4 tracking-tight uppercase leading-none">
                Relatório Gerado com Sucesso
              </h3>
              <p className="text-on-surface-variant font-medium mb-12 max-w-md leading-relaxed">
                Seu arquivo PDF de exportação consolidada foi processado e armazenado localmente. Você já pode visualizar ou encaminhar para a frota.
              </p>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 gap-6 w-full mb-12">
                <div className="bg-surface-container-low p-5 rounded-2xl border border-on-surface/5">
                  <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2">ID do Documento</div>
                  <div className="text-primary font-headline font-black text-xl">#EXP-2024-082</div>
                </div>
                <div className="bg-surface-container-low p-5 rounded-2xl border border-on-surface/5">
                  <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2">Tamanho</div>
                  <div className="text-primary font-headline font-black text-xl">2.4 MB</div>
                </div>
              </div>

              {/* Action Stack */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button className="flex-1 h-16 bg-primary text-white font-headline font-black uppercase tracking-widest flex items-center justify-center gap-3 rounded-xl hover:bg-primary-container active:scale-[0.98] transition-all shadow-lg">
                  <FileTextIcon size={24} />
                  Abrir Arquivo
                </button>
                <button className="flex-1 h-16 bg-surface-container-high text-primary font-headline font-black uppercase tracking-widest flex items-center justify-center gap-3 rounded-xl hover:bg-surface-container transition-all active:scale-[0.98] shadow-sm">
                  <ShareIcon size={24} />
                  Compartilhar
                </button>
              </div>
              
              <button 
                onClick={() => navigate('/admin/productivity')}
                className="mt-10 text-primary/60 font-black uppercase text-[11px] tracking-[0.3em] hover:text-primary transition-colors duration-200"
              >
                Voltar ao Painel Principal
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Floating Status Bar */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none z-50">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-primary/95 backdrop-blur-2xl text-white px-8 py-4 rounded-full flex items-center gap-6 shadow-2xl border border-white/10 pointer-events-auto"
        >
          <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.5)]"></span>
          <span className="font-sans text-[10px] uppercase font-black tracking-[0.2em]">Sessão Segura: Terminal A-12</span>
          <div className="h-4 w-[1px] bg-white/20"></div>
          <span className="font-sans text-[10px] uppercase font-black tracking-[0.2em] opacity-60">14:22 GMT-3</span>
        </motion.div>
      </div>
    </div>
  );
}
