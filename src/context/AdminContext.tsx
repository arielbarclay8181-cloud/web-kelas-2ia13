import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin token exists in localStorage
    const token = localStorage.getItem('admin_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/admin/verify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        }
      );
      const data = await response.json();
      
      if (data.valid) {
        setIsAdmin(true);
      } else {
        localStorage.removeItem('admin_token');
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('admin_token');
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/admin/login`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d50695a3/admin/logout`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          }
        );
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
