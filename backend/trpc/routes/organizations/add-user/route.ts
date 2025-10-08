import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredOrganization, StoredUser } from '@/types/database';

const ORGANIZATIONS_KEY = 'organizations';

export default protectedProcedure
  .input(
    z.object({
      username: z.string().min(3),
      password: z.string().min(6),
      name: z.string().min(2),
      role: z.enum(['admin', 'member']),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const [organizationId, currentUserId] = ctx.token!.split(':');

    const orgsJson = await AsyncStorage.getItem(ORGANIZATIONS_KEY);
    const organizations: StoredOrganization[] = orgsJson ? JSON.parse(orgsJson) : [];

    const orgIndex = organizations.findIndex(org => org.id === organizationId);
    if (orgIndex === -1) {
      throw new Error('ארגון לא נמצא');
    }

    const currentUser = organizations[orgIndex].users.find(u => u.id === currentUserId);
    if (!currentUser || (currentUser.role !== 'owner' && currentUser.role !== 'admin')) {
      throw new Error('אין לך הרשאה להוסיף משתמשים');
    }

    const allUsers = organizations.flatMap(org => org.users);
    const existingUser = allUsers.find((u) => u.username === input.username);
    if (existingUser) {
      throw new Error('שם המשתמש כבר קיים במערכת');
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newUser: StoredUser = {
      id: userId,
      organizationId,
      username: input.username,
      password: input.password,
      name: input.name,
      role: input.role,
      createdAt: new Date().toISOString(),
    };

    organizations[orgIndex].users.push(newUser);
    await AsyncStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(organizations));

    return {
      id: userId,
      organizationId,
      username: input.username,
      name: input.name,
      role: input.role,
      createdAt: newUser.createdAt,
    };
  });
