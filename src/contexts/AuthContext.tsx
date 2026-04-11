import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  type: 'driver' | 'admin';
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (name: string, type: 'driver' | 'admin') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (name: string, type: 'driver' | 'admin') => {
    setUser({ name, type });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
