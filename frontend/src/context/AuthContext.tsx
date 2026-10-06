import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  switchRole: (newRole: UserRole) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('officer'); // Default role: Officer
  const [user, setUser] = useState<User | null>({
    id: 3,
    username: 'officer',
    email: 'officer@civicvision.ai',
    full_name: 'Dr. Ananya Roy (Director)',
    role: 'officer',
    zone: 'Citywide Command',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  });
  const [isLoading, setIsLoading] = useState(false);

  const switchRole = async (newRole: UserRole) => {
    setIsLoading(true);
    setRole(newRole);
    try {
      const res = await api.login(newRole);
      setUser(res.user);
    } catch (err) {
      console.warn('API auth switch offline, using local state fallback');
      const fallbackUsers: Record<UserRole, User> = {
        citizen: { id: 1, username: 'citizen', email: 'citizen@civicvision.ai', full_name: 'Aarav Sharma', role: 'citizen', zone: 'Central' },
        worker: { id: 2, username: 'worker', email: 'worker@civicvision.ai', full_name: 'Rajesh Kumar (Field Lead)', role: 'worker', zone: 'Central' },
        officer: { id: 3, username: 'officer', email: 'officer@civicvision.ai', full_name: 'Dr. Ananya Roy', role: 'officer', zone: 'Citywide' },
        admin: { id: 4, username: 'admin', email: 'admin@civicvision.ai', full_name: 'System Controller', role: 'admin', zone: 'Command' }
      };
      setUser(fallbackUsers[newRole]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, switchRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
