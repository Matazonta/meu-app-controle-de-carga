import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCargo } from '../contexts/CargoContext';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function StatusBanner() {
  const { isOffline, isSyncing } = useCargo();

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] pointer-events-none">
      <AnimatePresence mode="wait">
        {isOffline && (
          <motion.div
            key="offline"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="bg-amber-500 text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg pointer-events-auto"
          >
            <WifiOff size={16} />
            <span className="text-xs font-black uppercase tracking-widest">Modo Offline Ativo - Dados salvos localmente</span>
          </motion.div>
        )}

        {isSyncing && !isOffline && (
          <motion.div
            key="syncing"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="bg-primary text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg pointer-events-auto"
          >
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest">Sincronizando dados com o servidor...</span>
          </motion.div>
        )}

        {!isSyncing && !isOffline && (
          <motion.div
            key="online"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3 }}
            className="bg-green-600 text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg"
          >
            <CheckCircle2 size={16} />
            <span className="text-xs font-black uppercase tracking-widest">Conexão Restaurada - Sincronizado</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
