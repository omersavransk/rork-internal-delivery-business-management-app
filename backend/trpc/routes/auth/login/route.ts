import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredOrganization } from '@/types/database';

const ORGANIZATIONS_KEY = 'organizations';

export default publicProcedure
  .input(
    z.object({
      organizationId: z.string(),
      username: z.string(),
      password: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const orgsJson = await AsyncStorage.getItem(ORGANIZATIONS_KEY);
    const organizations: StoredOrganization[] = orgsJson ? JSON.parse(orgsJson) : [];

    const organization = organizations.find(org => org.id === input.organizationId);
    if (!organization) {
      throw new Error('ארגון לא נמצא');
    }

    const user = organization.users.find(
      (u) => u.username === input.username && u.password === input.password
    );

    if (!user) {
      throw new Error('שם משתמש או סיסמה שגויים');
    }

    return {
      id: user.id,
      organizationId: user.organizationId,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      token: `${input.organizationId}:${user.id}`,
    };
  });
