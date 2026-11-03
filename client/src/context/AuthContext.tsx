import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../api/client.js';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  canViewHealth: boolean;
  canManageAdmissions: boolean;
  canPromoteChild: boolean;
  canAdminister: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string }> = {
  admin: { email: 'admin@gurukula.org', pass: 'GurukulaAdmin2026!' },
  admissions: { email: 'admissions@gurukula.org', pass: 'GurukulaAdmissions2026!' },
  coordinator: { email: 'coordinator@gurukula.org', pass: 'GurukulaCoord2026!' },
  teacher: { email: 'teacher@gurukula.org', pass: 'GurukulaTeacher2026!' },
  management: { email: 'trustee@gurukula.org', pass: 'GurukulaTrustee2026!' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('gurukula_token');
      const role = localStorage.getItem('gurukula_demo_role');
      if (token && role) {
        const res: any = await api.get('/auth/me');
        setUser(res?.user || null);
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCurrentUser(); }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const role = (Object.keys(DEMO_CREDENTIALS) as UserRole[]).find(
        r => DEMO_CREDENTIALS[r].email.toLowerCase() === email.trim().toLowerCase() && DEMO_CREDENTIALS[r].pass === pass
      );
      if (!role) throw new Error('Invalid demo credentials. Use one of the demo accounts below.');
      const res: any = await api.post('/auth/login', { email, password: pass });
      localStorage.setItem('gurukula_token', res.token || `demo-${role}`);
      localStorage.setItem('gurukula_demo_role', role);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('gurukula_token');
    localStorage.removeItem('gurukula_demo_role');
    setUser(null);
  };

  const switchDemoRole = async (targetRole: UserRole) => {
    const creds = DEMO_CREDENTIALS[targetRole];
    await login(creds.email, creds.pass);
  };

  const role = user?.role || null;
  const canViewHealth = Boolean(role === 'admin' || role === 'coordinator' || user?.canViewHealthRecords);
  const canManageAdmissions = Boolean(role === 'admin' || role === 'admissions' || role === 'coordinator');
  const canPromoteChild = Boolean(role === 'admin' || role === 'coordinator');
  const canAdminister = Boolean(role === 'admin');

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, isLoading, login, logout, switchDemoRole, canViewHealth, canManageAdmissions, canPromoteChild, canAdminister }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
