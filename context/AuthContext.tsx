import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'FARMER';
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('agrivision_token');
      if (storedToken) {
        try {
          const res = await fetch('http://localhost:5000/api/auth/verify', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          const data = await res.json();
          if (res.ok && data.valid) {
            setToken(storedToken);
            setUser(data.user);
          } else {
            localStorage.removeItem('agrivision_token');
          }
        } catch (error) {
          console.error("Auth verification failed", error);
          localStorage.removeItem('agrivision_token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('agrivision_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('agrivision_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
