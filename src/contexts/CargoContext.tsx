import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc, 
  doc, 
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface CargoRegistration {
  id: string;
  driverName: string;
  productType: string;
  quantity: number;
  origin: string;
  destination: string;
  timestamp: string;
}

export interface DriverAccount {
  name: string;
  password: string | null;
}

export interface KMRegistration {
  id: string;
  date: string;
  time: string;
  vehicle: string;
  driver: string;
  start: string;
  end: string;
  total: string;
}

export interface AdminAlert {
  id: string;
  message: string;
  timestamp: string;
  type: 'cargo' | 'km';
}

interface CargoContextType {
  registrations: CargoRegistration[];
  kmRegistrations: KMRegistration[];
  drivers: DriverAccount[];
  alerts: AdminAlert[];
  isOffline: boolean;
  isSyncing: boolean;
  addRegistration: (registration: Omit<CargoRegistration, 'id' | 'timestamp'>) => void;
  addKMRegistration: (registration: Omit<KMRegistration, 'id'>) => void;
  updateKMRegistration: (registration: KMRegistration) => void;
  getDriverProductivity: (driverName: string) => number;
  addDriver: (name: string) => void;
  removeDriver: (name: string) => void;
  updateDriverName: (oldName: string, newName: string) => void;
  updateDriverPassword: (name: string, password: string) => void;
  clearAlerts: () => void;
  resetDailyData: () => void;
  hardResetDatabase: () => void;
}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

export function CargoProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [registrations, setRegistrations] = useState<CargoRegistration[]>([]);
  const [kmRegistrations, setKmRegistrations] = useState<KMRegistration[]>([]);
  const [drivers, setDrivers] = useState<DriverAccount[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);

  // Firestore Real-time Listeners
  useEffect(() => {
    const qRegs = query(collection(db, 'registrations'), orderBy('timestamp', 'desc'));
    const unsubRegs = onSnapshot(qRegs, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CargoRegistration));
      setRegistrations(data);
    });

    const qKm = query(collection(db, 'km_registrations'), orderBy('date', 'desc'));
    const unsubKm = onSnapshot(qKm, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KMRegistration));
      setKmRegistrations(data);
    });

    const unsubDrivers = onSnapshot(collection(db, 'drivers'), (snapshot) => {
      if (snapshot.empty) {
        // Seed default drivers if none exist
        const defaultDrivers = [
          'Robison', 'Wesley', 'Gil', 'Zonta', 'Eduardo', 'Luis', 'Joel'
        ];
        defaultDrivers.forEach(name => {
          setDoc(doc(db, 'drivers', name), { name, password: null });
        });
      } else {
        const data = snapshot.docs.map(doc => doc.data() as DriverAccount);
        setDrivers(data);
      }
    });

    const qAlerts = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'));
    const unsubAlerts = onSnapshot(qAlerts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminAlert));
      setAlerts(data);
    });

    return () => {
      unsubRegs();
      unsubKm();
      unsubDrivers();
      unsubAlerts();
    };
  }, []);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addAlert = async (message: string, type: 'cargo' | 'km') => {
    try {
      await addDoc(collection(db, 'alerts'), {
        message,
        timestamp: new Date().toISOString(),
        type
      });
    } catch (e) {
      console.error("Error adding alert: ", e);
    }
  };

  const addRegistration = async (reg: Omit<CargoRegistration, 'id' | 'timestamp'>) => {
    try {
      const timestamp = new Date().toISOString();
      await addDoc(collection(db, 'registrations'), {
        ...reg,
        timestamp
      });
      addAlert(`Nova carga registrada por ${reg.driverName}: ${reg.productType} de ${reg.origin} para ${reg.destination}`, 'cargo');
    } catch (e) {
      console.error("Error adding registration: ", e);
    }
  };

  const addKMRegistration = async (reg: Omit<KMRegistration, 'id'>) => {
    try {
      await addDoc(collection(db, 'km_registrations'), reg);
      addAlert(`KM Inicial registrado por ${reg.driver}: ${reg.start} KM (Veículo: ${reg.vehicle})`, 'km');
    } catch (e) {
      console.error("Error adding KM registration: ", e);
    }
  };

  const updateKMRegistration = async (reg: KMRegistration) => {
    try {
      await setDoc(doc(db, 'km_registrations', reg.id), reg);
      addAlert(`KM Final registrado por ${reg.driver}: ${reg.end} KM. Total: ${reg.total} (Veículo: ${reg.vehicle})`, 'km');
    } catch (e) {
      console.error("Error updating KM registration: ", e);
    }
  };

  const getDriverProductivity = (driverName: string) => {
    return registrations.filter((r) => r.driverName.toLowerCase() === driverName.toLowerCase()).length;
  };

  const addDriver = async (name: string) => {
    if (!drivers.find(d => d.name === name)) {
      try {
        await setDoc(doc(db, 'drivers', name), { name, password: null });
      } catch (e) {
        console.error("Error adding driver: ", e);
      }
    }
  };

  const removeDriver = async (name: string) => {
    try {
      await deleteDoc(doc(db, 'drivers', name));
    } catch (e) {
      console.error("Error removing driver: ", e);
    }
  };

  const updateDriverName = async (oldName: string, newName: string) => {
    try {
      const batch = writeBatch(db);
      
      // Update driver doc
      batch.set(doc(db, 'drivers', newName), { name: newName, password: drivers.find(d => d.name === oldName)?.password || null });
      batch.delete(doc(db, 'drivers', oldName));

      await batch.commit();
      
      // Note: In a real app, we'd also update all registrations and KM docs.
      // For this prototype, we'll focus on the primary driver record.
    } catch (e) {
      console.error("Error updating driver name: ", e);
    }
  };

  const updateDriverPassword = async (name: string, password: string) => {
    try {
      await setDoc(doc(db, 'drivers', name), { name, password }, { merge: true });
    } catch (e) {
      console.error("Error updating driver password: ", e);
    }
  };

  const clearAlerts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'alerts'));
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (e) {
      console.error("Error clearing alerts: ", e);
    }
  };

  const resetDailyData = async () => {
    try {
      const batch = writeBatch(db);
      
      // Clear KM registrations
      const kmSnapshot = await getDocs(collection(db, 'km_registrations'));
      kmSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Clear alerts
      const alertsSnapshot = await getDocs(collection(db, 'alerts'));
      alertsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      await batch.commit();
      addAlert('Sistema resetado para o novo dia. Histórico de cargas preservado.', 'cargo');
    } catch (e) {
      console.error("Error resetting daily data: ", e);
    }
  };

  const hardResetDatabase = async () => {
    try {
      const batch = writeBatch(db);
      
      // Clear ALL registrations (Cargas)
      const regSnapshot = await getDocs(collection(db, 'registrations'));
      regSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      // Clear ALL KM registrations
      const kmSnapshot = await getDocs(collection(db, 'km_registrations'));
      kmSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Clear ALL alerts
      const alertsSnapshot = await getDocs(collection(db, 'alerts'));
      alertsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      // Reset Driver passwords
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      driversSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { password: null });
      });
      
      await batch.commit();
      addAlert('RESET TOTAL REALIZADO. Todo o banco de dados foi limpo.', 'cargo');
    } catch (e) {
      console.error("Error performing hard reset: ", e);
    }
  };

  return (
    <CargoContext.Provider value={{ 
      registrations, 
      kmRegistrations,
      drivers, 
      alerts,
      isOffline,
      isSyncing,
      addRegistration, 
      addKMRegistration,
      updateKMRegistration,
      getDriverProductivity, 
      addDriver, 
      removeDriver, 
      updateDriverName,
      updateDriverPassword,
      clearAlerts,
      resetDailyData,
      hardResetDatabase
    }}>
      {children}
    </CargoContext.Provider>
  );
}

export function useCargo() {
  const context = useContext(CargoContext);
  if (context === undefined) {
    throw new Error('useCargo must be used within a CargoProvider');
  }
  return context;
}
