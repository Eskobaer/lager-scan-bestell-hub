import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { database, User } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await database.init();
        const storedUser = localStorage.getItem('auth-user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Verify user still exists in database
          const currentUser = database.authenticateUser(parsedUser.username, parsedUser.password);
          if (currentUser) {
            setUser(currentUser);
          } else {
            // User no longer valid, clear storage
            localStorage.removeItem('auth-user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('auth-user');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      await database.init();
      const authenticatedUser = database.authenticateUser(username, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('auth-user', JSON.stringify(authenticatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth-user');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };