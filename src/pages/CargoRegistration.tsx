import { QrCodeIcon, Inventory2, MapPinIcon, NavigationIcon, VerifiedIcon, LocalShipping, XIcon } from '@/src/components/Icons';
import { motion, AnimatePresence } from 'motion/react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCargo } from '../contexts/CargoContext';
import { Html5Qrcode } from 'html5-qrcode';

export default function CargoRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addRegistration } = useCargo();
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  
  const [formData, setFormData] = useState({
    productType: 'Palette',
    quantity: '',
    origin: 'GP1',
    destination: 'GP1',
    notes: ''
  });

  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        onScanSuccess,
        onScanFailure
      ).catch(err => {
        console.error("Error starting scanner:", err);
        // Fallback if environment camera is not available
        html5QrCode.start(
          { facingMode: "user" },
          config,
          onScanSuccess,
          onScanFailure
        ).catch(e => console.error("Final fallback failed:", e));
      });
    }

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current?.clear();
        }).catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [isScanning]);

  function onScanSuccess(decodedText: string) {
    try {
      // Try to parse as JSON first
      const data = JSON.parse(decodedText);
      setFormData({
        productType: data.productType || formData.productType,
        quantity: data.quantity?.toString() || formData.quantity,
        origin: data.origin || formData.origin,
        destination: data.destination || formData.destination,
        notes: data.notes || 'Escaneado via QR Code'
      });
    } catch (e) {
      // Fallback: if it's a string, maybe it's pipe separated?
      const parts = decodedText.split('|');
      if (parts.length >= 4) {
        setFormData({
          productType: parts[0],
          quantity: parts[1],
          origin: parts[2],
          destination: parts[3],
          notes: parts[4] || 'Escaneado via QR Code'
        });
      } else {
        // Just put the whole text in notes if we can't parse it
        setFormData(prev => ({ ...prev, notes: decodedText }));
      }
    }
    setIsScanning(false);
  }

  function onScanFailure(error: any) {
    // console.warn(`Code scan error = ${error}`);
  }

  const handleScan = () => {
    setIsScanning(true);
  };

  const handleSave = () => {
    if (!formData.quantity) return;
    
    addRegistration({
      driverName: user?.name || 'Motorista',
      productType: formData.productType,
      quantity: parseInt(formData.quantity),
      origin: formData.origin,
      destination: formData.destination
    });
    
    navigate('/driver/dashboard');
  };

  return (
    <div className="bg-surface min-h-screen pb-24">
      <TopBar title="Controle de Cargas" showMenu={false} />
      
      <main className="max-w-4xl mx-auto px-4 pt-28 space-y-6">
        {/* QR Scanner Modal */}
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden relative">
                <div className="p-6 border-b border-on-surface/5 flex justify-between items-center">
                  <h3 className="font-bold text-primary uppercase tracking-widest">Escanear QR Code</h3>
                  <button 
                    onClick={() => setIsScanning(false)}
                    className="p-2 hover:bg-surface-container rounded-full transition-colors"
                  >
                    <XIcon size={24} />
                  </button>
                </div>
                <div className="relative">
                  <div id="reader" className="w-full"></div>
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 bg-primary/50 shadow-[0_0_15px_rgba(188,1,0,0.8)]"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <p className="text-xs text-on-surface-variant font-medium">Posicione o código dentro do quadrado para leitura automática.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Header / Scan Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-primary-container p-1 shadow-lg"
        >
          <div className="bg-primary px-6 py-10 flex flex-col items-center text-center space-y-6 rounded-[0.9rem]">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">Entrada de Carga</h2>
              <p className="text-white/80 text-sm font-medium">Digitalize o código para identificação imediata</p>
            </div>
            <button 
              onClick={handleScan}
              className="group flex items-center gap-4 bg-secondary px-8 py-5 rounded-xl hover:brightness-110 active:scale-95 transition-all duration-200 shadow-xl"
            >
              <QrCodeIcon className="text-white" size={32} />
              <span className="text-white font-bold text-lg uppercase tracking-widest">Escanear QR Code</span>
            </button>
          </div>
          {/* Decorative Industrial Elements */}
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Inventory2 className="text-white" size={96} />
          </div>
        </motion.section>

        {/* Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <section className="bg-white rounded-2xl p-8 shadow-sm border-l-8 border-primary md:col-span-12">
            <div className="flex items-center gap-3 mb-8">
              <LocalShipping className="text-primary" size={24} />
              <h3 className="text-lg font-bold text-primary uppercase tracking-wider">Especificações do Lote</h3>
            </div>
            
            <form className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Tipo de Produto */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Tipo de Produto</label>
                  <div className="relative">
                    <select 
                      value={formData.productType}
                      onChange={(e) => setFormData({...formData, productType: e.target.value})}
                      className="w-full h-16 pl-4 pr-10 bg-surface-container-low border-none rounded-xl text-primary font-bold focus:ring-2 focus:ring-primary transition-all appearance-none"
                    >
                      <option>Palette</option>
                      <option>Caixas</option>
                      <option>Monitores</option>
                      <option>Gabinetes</option>
                      <option>Cadeiras</option>
                      <option>Mesas</option>
                      <optgroup label="Leva ALE">
                        {Array.from({ length: 30 }, (_, i) => (
                          <option key={`ale-${i+1}`} value={`Leva ${i+1} ALE`}>Leva {i+1} ALE</option>
                        ))}
                      </optgroup>
                      <optgroup label="Leva Estoque">
                        {Array.from({ length: 30 }, (_, i) => (
                          <option key={`estoque-${i+1}`} value={`Leva ${i+1} Estoque`}>Leva {i+1} Estoque</option>
                        ))}
                      </optgroup>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                      <Inventory2 size={20} />
                    </div>
                  </div>
                </div>
                
                {/* Quantidade */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Quantidade</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full h-16 px-4 bg-surface-container-low border-none rounded-xl text-primary font-bold focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Origem */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Origem</label>
                  <div className="relative">
                    <select 
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      className="w-full h-16 pl-4 pr-10 bg-surface-container-low border-none rounded-xl text-primary font-bold focus:ring-2 focus:ring-primary transition-all appearance-none"
                    >
                      <option>GP1</option>
                      <option>PLP</option>
                      <option>GP4</option>
                      <option>GP5</option>
                      <option>GP6</option>
                      <option>GP9</option>
                      <option>GP10</option>
                      <option>GPN</option>
                      <option>Fabrica Camisa</option>
                      <option>Desenvolvimento</option>
                      <option>Studio</option>
                      <option>Loja</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                      <MapPinIcon size={20} />
                    </div>
                  </div>
                </div>
                
                {/* Destino */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Destino</label>
                  <div className="relative">
                    <select 
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="w-full h-16 pl-4 pr-10 bg-surface-container-low border-none rounded-xl text-primary font-bold focus:ring-2 focus:ring-primary transition-all appearance-none"
                    >
                      <option>GP1</option>
                      <option>PLP</option>
                      <option>GP4</option>
                      <option>GP5</option>
                      <option>GP6</option>
                      <option>GP9</option>
                      <option>GP10</option>
                      <option>GPN</option>
                      <option>Fabrica Camisa</option>
                      <option>Desenvolvimento</option>
                      <option>Studio</option>
                      <option>Loja</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                      <NavigationIcon size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Observações do Manifesto</label>
                <textarea 
                  className="w-full p-4 bg-surface-container-low border-none rounded-xl text-primary font-medium focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder="Ex: Carga frágil, empilhamento máximo 3 unidades..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </form>
          </section>
        </div>

        {/* Primary Action */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-2xl p-6 border border-on-surface/5 shadow-sm">
          <div className="flex items-center gap-3">
            <VerifiedIcon className="text-primary" size={24} />
            <p className="text-sm font-medium text-on-surface-variant">Confirme todos os dados antes de finalizar o registro.</p>
          </div>
          <button 
            onClick={handleSave}
            className="w-full sm:w-auto h-16 px-12 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-container active:scale-95 transition-all shadow-lg"
          >
            Salvar Registro
          </button>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
