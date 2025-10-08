import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'all_users';

interface StoredUser {
  id: string;
  businessId: string;
  username: string;
  password: string;
  name: string;
  businessName: string;
  createdAt: string;
}

export default publicProcedure
  .input(
    z.object({
      username: z.string().min(3),
      password: z.string().min(6),
      name: z.string().min(2),
      businessName: z.string().min(2),
    })
  )
  .mutation(async ({ input }) => {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

    const existingUser = users.find((u) => u.username === input.username);
    if (existingUser) {
      throw new Error('שם המשתמש כבר קיים במערכת');
    }

    const businessId = `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newUser: StoredUser = {
      id: userId,
      businessId,
      username: input.username,
      password: input.password,
      name: input.name,
      businessName: input.businessName,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

    return {
      id: userId,
      businessId,
      username: input.username,
      name: input.name,
      businessName: input.businessName,
      createdAt: newUser.createdAt,
      token: userId,
    };
  });
