import { protectedProcedure } from '../../../create-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredOrganization } from '@/types/database';

const ORGANIZATIONS_KEY = 'organizations';

export default protectedProcedure
  .query(async ({ ctx }) => {
    const [organizationId] = ctx.token!.split(':');

    const orgsJson = await AsyncStorage.getItem(ORGANIZATIONS_KEY);
    const organizations: StoredOrganization[] = orgsJson ? JSON.parse(orgsJson) : [];

    const organization = organizations.find(org => org.id === organizationId);
    if (!organization) {
      throw new Error('ארגון לא נמצא');
    }

    return organization.users.map(user => ({
      id: user.id,
      organizationId: user.organizationId,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    }));
  });
