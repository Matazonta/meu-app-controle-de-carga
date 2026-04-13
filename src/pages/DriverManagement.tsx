import { SearchIcon, UserPlusIcon, EditIcon, TrashIcon, KeyIcon, ChevronLeftIcon, ChevronRightIcon } from '@/src/components/Icons';
import { motion, AnimatePresence } from 'motion/react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useCargo } from '../contexts/CargoContext';
import { useState, useEffect } from 'react';

export default function DriverManagement() {
  const navigate = useNavigate();
  const { drivers, addDriver, removeDriver, updateDriverName, updateDriverPassword, isBackgroundSyncing } = useCargo();
  const [newDriverName, setNewDriverName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDriver, setEditingDriver] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingDriver, setDeletingDriver] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!isBackgroundSyncing) {
      setLastUpdated(new Date());
    }
  }, [isBackgroundSyncing]);

  const handleAddDriver = async () => {
    const name = newDriverName.trim();
    if (!name) return;
    
    if (drivers.find(d => d.name.toLowerCase() === name.toLowerCase())) {
      setStatusMessage({ text: 'Este motorista já está cadastrado.', type: 'error' });
      return;
    }

    setIsAdding(true);
    setStatusMessage(null);
    try {
      await addDriver(name);
      setNewDriverName('');
      setStatusMessage({ text: `Motorista ${name} cadastrado com sucesso!`, type: 'success' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e: any) {
      setStatusMessage({ 
        text: e.message || 'Erro ao cadastrar motorista. Tente novamente.', 
        type: 'error' 
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingDriver) {
      try {
        await removeDriver(deletingDriver);
        setStatusMessage({ text: `Motorista ${deletingDriver} removido com sucesso!`, type: 'success' });
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (e: any) {
        setStatusMessage({ 
          text: e.message || 'Erro ao remover motorista.', 
          type: 'error' 
        });
      } finally {
        setDeletingDriver(null);
      }
    }
  };

  const handleConfirmResetPassword = async () => {
    if (resettingPassword) {
      try {
        // In this system, setting password to null/empty triggers "First Access" mode
        await updateDriverPassword(resettingPassword, ""); 
        setStatusMessage({ text: `Senha de ${resettingPassword} resetada! O motorista deve definir uma nova no próximo login.`, type: 'success' });
        setTimeout(() => setStatusMessage(null), 5000);
      } catch (e: any) {
        setStatusMessage({ 
          text: e.message || 'Erro ao resetar senha.', 
          type: 'error' 
        });
      } finally {
        setResettingPassword(null);
      }
    }
  };

  const handleStartEdit = (name: string) => {
    setEditingDriver(name);
    setEditName(name);
  };

  const handleSaveEdit = () => {
    if (editingDriver && editName.trim() && editName.trim() !== editingDriver) {
      updateDriverName(editingDriver, editName.trim());
    }
    setEditingDriver(null);
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-surface min-h-screen pb-24">
      <TopBar title="Controle de Cargas" userType="admin" />
      
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-8">
        {/* Dashboard Header & Search */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-extrabold tracking-tight text-primary uppercase">Gestão de Motoristas</h2>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-2 border border-green-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-on-surface-variant font-medium">Controle e administração de frotas e condutores</p>
              <motion.span 
                key={lastUpdated.getTime()}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest"
              >
                • Sincronizado às {lastUpdated.toLocaleTimeString('pt-BR')}
              </motion.span>
            </div>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow sm:w-80">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={20} />
              <input 
                className="w-full pl-12 pr-4 py-4 bg-white border border-on-surface/5 rounded-xl focus:ring-2 focus:ring-primary text-on-surface font-medium placeholder:text-on-surface-variant/50 transition-all shadow-sm" 
                placeholder="Search by name..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Nome do Motorista"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  disabled={isAdding}
                  className="px-4 py-4 bg-white border border-on-surface/5 rounded-xl focus:ring-2 focus:ring-primary text-on-surface font-medium shadow-sm disabled:opacity-50"
                />
                <button 
                  onClick={handleAddDriver}
                  disabled={isAdding || !newDriverName.trim()}
                  className="bg-primary text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary-container active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:scale-100"
                >
                  <UserPlusIcon size={20} />
                  <span className="hidden sm:inline">{isAdding ? 'Salvando...' : 'Adicionar'}</span>
                </button>
              </div>
              {statusMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 ${statusMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {statusMessage.text}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Drivers List */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-on-surface/5">
          {/* Header Row (Desktop Only) */}
          <div className="hidden lg:grid grid-cols-12 bg-surface-container-low px-8 py-5 text-xs font-black uppercase tracking-widest text-on-surface-variant">
            <div className="col-span-8">Nome</div>
            <div className="col-span-4 text-right">Ações</div>
          </div>

          <motion.div 
            layout
            className="divide-y divide-on-surface/5"
          >
            <AnimatePresence initial={false}>
              {filteredDrivers.map((driver, index) => (
                <motion.div 
                  key={driver.name}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-1 lg:grid-cols-12 items-center px-8 py-6 group hover:bg-surface-container-low transition-colors"
                >
                  <div className="col-span-8 flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-xl shadow-inner">
                      {driver.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-grow">
                      {editingDriver === driver.name ? (
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-3 py-2 bg-surface-container border border-primary/20 rounded-lg text-primary font-bold focus:ring-2 focus:ring-primary outline-none w-full max-w-xs"
                            autoFocus
                          />
                          <button 
                            onClick={handleSaveEdit}
                            className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-xs uppercase"
                          >
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingDriver(null)}
                            className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-bold text-xs uppercase"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="font-bold text-xl text-primary tracking-tight">{driver.name}</div>
                          <div className="text-xs text-on-surface-variant font-medium">
                            {driver.password ? 'Senha Definida' : 'Aguardando Primeiro Acesso'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-4 flex justify-end gap-3 mt-6 lg:mt-0">
                    {!editingDriver && (
                      <>
                        <button 
                          onClick={() => setResettingPassword(driver.name)}
                          title="Resetar Senha"
                          className="p-3 hover:bg-amber-50 rounded-xl transition-colors text-amber-600 border border-amber-100"
                        >
                          <KeyIcon size={20} />
                        </button>
                        <button 
                          onClick={() => handleStartEdit(driver.name)}
                          className="p-3 hover:bg-primary/10 rounded-xl transition-colors text-primary border border-primary/10"
                        >
                          <EditIcon size={20} />
                        </button>
                        <button 
                          onClick={() => setDeletingDriver(driver.name)}
                          className="p-3 hover:bg-red-50 rounded-xl transition-colors text-red-600 border border-red-100"
                        >
                          <TrashIcon size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredDrivers.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center text-on-surface-variant font-medium"
              >
                Nenhum motorista encontrado.
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Delete Confirmation Modal */}
        {deletingDriver && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-on-surface/10"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <TrashIcon size={32} />
              </div>
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight mb-4">Excluir Motorista?</h3>
              <p className="text-on-surface-variant font-medium mb-8 leading-relaxed">
                Você está prestes a excluir <span className="font-bold text-primary">{deletingDriver}</span>. 
                Esta ação não pode ser desfeita e o motorista perderá acesso ao sistema.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingDriver(null)}
                  className="flex-1 py-4 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-container transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reset Password Confirmation Modal */}
        {resettingPassword && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-on-surface/10"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <KeyIcon size={32} />
              </div>
              <h3 className="text-2xl font-black text-primary uppercase tracking-tight mb-4">Resetar Senha?</h3>
              <p className="text-on-surface-variant font-medium mb-8 leading-relaxed">
                Deseja resetar a senha de <span className="font-bold text-primary">{resettingPassword}</span>? 
                <br/><br/>
                No próximo acesso, o motorista poderá definir uma nova senha.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setResettingPassword(null)}
                  className="flex-1 py-4 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-container transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmResetPassword}
                  className="flex-1 py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg"
                >
                  Resetar Senha
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
