import { protectedProcedure } from '../../../create-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredOrganization } from '@/types/database';

const ORGANIZATIONS_KEY = 'organizations';

export default protectedProcedure.query(async ({ ctx }) => {
  const [organizationId, userId] = ctx.token!.split(':');

  const orgsJson = await AsyncStorage.getItem(ORGANIZATIONS_KEY);
  const organizations: StoredOrganization[] = orgsJson ? JSON.parse(orgsJson) : [];

  const organization = organizations.find(org => org.id === organizationId);
  if (!organization) {
    throw new Error('ארגון לא נמצא');
  }

  const user = organization.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error('משתמש לא נמצא');
  }

  return {
    id: user.id,
    organizationId: user.organizationId,
    username: user.username,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    organization: {
      id: organization.id,
      name: organization.name,
      createdAt: organization.createdAt,
    },
  };
});
