import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@/types/database';
import { trpcClient } from '@/lib/trpc';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const userData = await trpcClient.auth.me.query();
        setUser({ ...userData, token });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (organizationId: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await trpcClient.auth.login.mutate({ organizationId, email, password });
      await AsyncStorage.setItem('auth_token', result.token);
      setUser(result);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'שגיאה בהתחברות' };
    }
  }, []);

  const register = useCallback(async (
    organizationId: string,
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await trpcClient.auth.register.mutate({ organizationId, email, password, name });
      await AsyncStorage.setItem('auth_token', result.token);
      setUser(result);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'שגיאה ברישום' };
    }
  }, []);

  const createOrganization = useCallback(async (
    organizationName: string,
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await trpcClient.organizations.create.mutate({ organizationName, email, password, name });
      await AsyncStorage.setItem('auth_token', result.user.token);
      setUser(result.user);
      return { success: true };
    } catch (error) {
      console.error('Organization creation failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'שגיאה ביצירת ארגון' };
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    login,
    register,
    createOrganization,
    logout,
  }), [user, isLoading, login, register, createOrganization, logout]);
});
