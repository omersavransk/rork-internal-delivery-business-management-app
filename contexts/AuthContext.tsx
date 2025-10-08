import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@/types/database';

const MOCK_USERS: { username: string; password: string; user: User }[] = [
  {
    username: 'partner1',
    password: 'demo123',
    user: {
      id: '1',
      username: 'partner1',
      name: 'שותף 1',
      createdAt: new Date().toISOString(),
    },
  },
  {
    username: 'partner2',
    password: 'demo123',
    user: {
      id: '2',
      username: 'partner2',
      name: 'שותף 2',
      createdAt: new Date().toISOString(),
    },
  },
];

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const mockUser = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (mockUser) {
      await AsyncStorage.setItem('user', JSON.stringify(mockUser.user));
      setUser(mockUser.user);
      return true;
    }

    return false;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
  }), [user, isLoading, login, logout]);
});
