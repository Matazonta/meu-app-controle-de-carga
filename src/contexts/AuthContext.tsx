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
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cargo_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (name: string, type: 'driver' | 'admin') => {
    const newUser: User = { name, type };
    setUser(newUser);
    localStorage.setItem('cargo_auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cargo_auth_user');
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
