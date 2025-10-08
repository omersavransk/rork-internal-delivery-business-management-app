import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredOrganization, StoredUser } from '@/types/database';

const ORGANIZATIONS_KEY = 'organizations';

export default publicProcedure
  .input(
    z.object({
      organizationName: z.string().min(2),
      username: z.string().min(3),
      password: z.string().min(6),
      name: z.string().min(2),
    })
  )
  .mutation(async ({ input }) => {
    const orgsJson = await AsyncStorage.getItem(ORGANIZATIONS_KEY);
    const organizations: StoredOrganization[] = orgsJson ? JSON.parse(orgsJson) : [];

    const allUsers = organizations.flatMap(org => org.users);
    const existingUser = allUsers.find((u) => u.username === input.username);
    if (existingUser) {
      throw new Error('שם המשתמש כבר קיים במערכת');
    }

    const organizationId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newUser: StoredUser = {
      id: userId,
      organizationId,
      username: input.username,
      password: input.password,
      name: input.name,
      role: 'owner',
      createdAt: new Date().toISOString(),
    };

    const newOrganization: StoredOrganization = {
      id: organizationId,
      name: input.organizationName,
      createdAt: new Date().toISOString(),
      users: [newUser],
    };

    organizations.push(newOrganization);
    await AsyncStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(organizations));

    return {
      organization: {
        id: organizationId,
        name: input.organizationName,
        createdAt: newOrganization.createdAt,
      },
      user: {
        id: userId,
        organizationId,
        username: input.username,
        name: input.name,
        role: 'owner' as const,
        createdAt: newUser.createdAt,
        token: `${organizationId}:${userId}`,
      },
    };
  });
