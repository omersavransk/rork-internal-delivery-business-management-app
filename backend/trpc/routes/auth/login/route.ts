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
      username: z.string(),
      password: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

    const user = users.find(
      (u) => u.username === input.username && u.password === input.password
    );

    if (!user) {
      throw new Error('שם משתמש או סיסמה שגויים');
    }

    return {
      id: user.id,
      businessId: user.businessId,
      username: user.username,
      name: user.name,
      businessName: user.businessName,
      createdAt: user.createdAt,
      token: user.id,
    };
  });
