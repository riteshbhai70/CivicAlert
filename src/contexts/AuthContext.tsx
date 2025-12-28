import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types/incident';
import { authApi } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('civicalert_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setState({ isAuthenticated: true, user });
      } catch {
        localStorage.removeItem('civicalert_user');
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authApi.login(username, password);
      localStorage.setItem('civicalert_user', JSON.stringify(user));
      setState({ isAuthenticated: true, user });
    } catch (err) {
      setError('Invalid username or password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('civicalert_user');
    setState({ isAuthenticated: false, user: null });
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isLoading,
        error,
        clearError,
      }}
    >
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
