import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

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
  addRegistration: (registration: Omit<CargoRegistration, 'id' | 'timestamp'>) => Promise<void>;
  addKMRegistration: (registration: Omit<KMRegistration, 'id'>) => Promise<void>;
  updateKMRegistration: (registration: KMRegistration) => Promise<void>;
  getDriverProductivity: (driverName: string) => number;
  addDriver: (name: string) => Promise<void>;
  removeDriver: (name: string) => Promise<void>;
  updateDriverName: (oldName: string, newName: string) => Promise<void>;
  updateDriverPassword: (name: string, password: string) => Promise<void>;
  clearAlerts: () => Promise<void>;
  resetDailyData: () => Promise<void>;
  hardResetDatabase: () => Promise<void>;
}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

export function CargoProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [registrations, setRegistrations] = useState<CargoRegistration[]>([]);
  const [kmRegistrations, setKmRegistrations] = useState<KMRegistration[]>([]);
  const [drivers, setDrivers] = useState<DriverAccount[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [regsRes, kmRes, driversRes, alertsRes] = await Promise.all([
        fetch('/api/registrations'),
        fetch('/api/km'),
        fetch('/api/drivers'),
        fetch('/api/alerts')
      ]);

      const [regs, km, drvs, alrts] = await Promise.all([
        regsRes.json(),
        kmRes.json(),
        driversRes.json(),
        alertsRes.json()
      ]);

      setRegistrations(regs);
      setKmRegistrations(km);
      setDrivers(drvs);
      setAlerts(alrts);
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll every 5 seconds for "real-time" updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsSyncing(true);
      fetchData();
      setTimeout(() => setIsSyncing(false), 2000);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchData]);

  const addAlert = async (message: string, type: 'cargo' | 'km') => {
    const id = Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString();
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, message, timestamp, type })
    });
    fetchData();
  };

  const addRegistration = async (reg: Omit<CargoRegistration, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString();
    await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...reg, id, timestamp })
    });
    addAlert(`Nova carga registrada por ${reg.driverName}: ${reg.productType} de ${reg.origin} para ${reg.destination}`, 'cargo');
    fetchData();
  };

  const addKMRegistration = async (reg: Omit<KMRegistration, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    await fetch('/api/km', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...reg, id })
    });
    addAlert(`KM Inicial registrado por ${reg.driver}: ${reg.start} KM (Veículo: ${reg.vehicle})`, 'km');
    fetchData();
  };

  const updateKMRegistration = async (reg: KMRegistration) => {
    await fetch('/api/km', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reg)
    });
    addAlert(`KM Final registrado por ${reg.driver}: ${reg.end} KM. Total: ${reg.total} (Veículo: ${reg.vehicle})`, 'km');
    fetchData();
  };

  const getDriverProductivity = (driverName: string) => {
    return registrations.filter((r) => r.driverName.toLowerCase() === driverName.toLowerCase()).length;
  };

  const addDriver = async (name: string) => {
    if (!drivers.find(d => d.name === name)) {
      await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: null })
      });
      fetchData();
    }
  };

  const removeDriver = async (name: string) => {
    await fetch(`/api/drivers/${name}`, { method: 'DELETE' });
    fetchData();
  };

  const updateDriverName = async (oldName: string, newName: string) => {
    const driver = drivers.find(d => d.name === oldName);
    await fetch(`/api/drivers/${oldName}`, { method: 'DELETE' });
    await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, password: driver?.password || null })
    });
    fetchData();
  };

  const updateDriverPassword = async (name: string, password: string) => {
    await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    });
    fetchData();
  };

  const clearAlerts = async () => {
    await fetch('/api/alerts', { method: 'DELETE' });
    fetchData();
  };

  const resetDailyData = async () => {
    await fetch('/api/reset-daily', { method: 'POST' });
    addAlert('Sistema resetado para o novo dia. Histórico de cargas preservado.', 'cargo');
    fetchData();
  };

  const hardResetDatabase = async () => {
    await fetch('/api/hard-reset', { method: 'POST' });
    addAlert('RESET TOTAL REALIZADO. Todo o banco de dados foi limpo.', 'cargo');
    fetchData();
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
