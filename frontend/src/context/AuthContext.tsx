import React, { createContext, useContext } from 'react';
import { UserRole, UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  token: string | null;
  login: (emailOrRole: string, password?: string) => Promise<boolean>;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const noServerAuth: AuthContextType = {
  user: null,
  role: 'VISITOR',
  token: null,
  login: async () => false,
  loginWithCredentials: async () => false,
  logout: () => undefined,
  isStaff: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthContext.Provider value={noServerAuth}>{children}</AuthContext.Provider>
);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
