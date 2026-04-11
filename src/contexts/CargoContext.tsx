import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  id: number;
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
  addRegistration: (registration: Omit<CargoRegistration, 'id' | 'timestamp'>) => void;
  addKMRegistration: (registration: KMRegistration) => void;
  updateKMRegistration: (registration: KMRegistration) => void;
  getDriverProductivity: (driverName: string) => number;
  addDriver: (name: string) => void;
  removeDriver: (name: string) => void;
  updateDriverName: (oldName: string, newName: string) => void;
  updateDriverPassword: (name: string, password: string) => void;
  clearAlerts: () => void;
}

const CargoContext = createContext<CargoContextType | undefined>(undefined);

export function CargoProvider({ children }: { children: ReactNode }) {
  const [registrations, setRegistrations] = useState<CargoRegistration[]>([]);
  const [kmRegistrations, setKmRegistrations] = useState<KMRegistration[]>([
    { id: 1, date: '10/04/2026', time: '08:00', vehicle: 'SC-4592', driver: 'Robison', start: '142.100', end: '142.220', total: '120 km' },
    { id: 2, date: '09/04/2026', time: '08:15', vehicle: 'SC-4592', driver: 'Wesley', start: '142.000', end: '142.100', total: '100 km' },
  ]);
  const [drivers, setDrivers] = useState<DriverAccount[]>([
    { name: 'Robison', password: null },
    { name: 'Wesley', password: null },
    { name: 'Gil', password: null },
    { name: 'Zonta', password: null },
    { name: 'Eduardo', password: null },
    { name: 'Luis', password: null },
    { name: 'Joel', password: null },
  ]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);

  const addAlert = (message: string, type: 'cargo' | 'km') => {
    const newAlert: AdminAlert = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date().toLocaleString('pt-BR'),
      type
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const addRegistration = (reg: Omit<CargoRegistration, 'id' | 'timestamp'>) => {
    const newReg: CargoRegistration = {
      ...reg,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setRegistrations((prev) => [newReg, ...prev]);
    addAlert(`Nova carga registrada por ${reg.driverName}: ${reg.productType} de ${reg.origin} para ${reg.destination}`, 'cargo');
  };

  const addKMRegistration = (reg: KMRegistration) => {
    setKmRegistrations((prev) => [reg, ...prev]);
    addAlert(`KM Inicial registrado por ${reg.driver}: ${reg.start} KM (Veículo: ${reg.vehicle})`, 'km');
  };

  const updateKMRegistration = (reg: KMRegistration) => {
    setKmRegistrations((prev) => prev.map(r => r.id === reg.id ? reg : r));
    addAlert(`KM Final registrado por ${reg.driver}: ${reg.end} KM. Total: ${reg.total} (Veículo: ${reg.vehicle})`, 'km');
  };

  const getDriverProductivity = (driverName: string) => {
    return registrations.filter((r) => r.driverName.toLowerCase() === driverName.toLowerCase()).length;
  };

  const addDriver = (name: string) => {
    if (!drivers.find(d => d.name === name)) {
      setDrivers((prev) => [...prev, { name, password: null }]);
    }
  };

  const removeDriver = (name: string) => {
    setDrivers((prev) => prev.filter((d) => d.name !== name));
  };

  const updateDriverName = (oldName: string, newName: string) => {
    setDrivers((prev) => prev.map(d => 
      d.name === oldName ? { ...d, name: newName } : d
    ));
    // Also update registrations to maintain history
    setRegistrations((prev) => prev.map(r => 
      r.driverName === oldName ? { ...r, driverName: newName } : r
    ));
    // And KM registrations
    setKmRegistrations((prev) => prev.map(r => 
      r.driver === oldName ? { ...r, driver: newName } : r
    ));
  };

  const updateDriverPassword = (name: string, password: string) => {
    setDrivers((prev) => prev.map(d => 
      d.name === name ? { ...d, password } : d
    ));
  };

  const clearAlerts = () => setAlerts([]);

  return (
    <CargoContext.Provider value={{ 
      registrations, 
      kmRegistrations,
      drivers, 
      alerts,
      addRegistration, 
      addKMRegistration,
      updateKMRegistration,
      getDriverProductivity, 
      addDriver, 
      removeDriver, 
      updateDriverName,
      updateDriverPassword,
      clearAlerts
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
