import { protectedProcedure } from '../../../create-context';
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

export default protectedProcedure.query(async ({ ctx }) => {
  const usersJson = await AsyncStorage.getItem(USERS_KEY);
  const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

  const user = users.find((u) => u.id === ctx.userId);

  if (!user) {
    throw new Error('משתמש לא נמצא');
  }

  return {
    id: user.id,
    businessId: user.businessId,
    username: user.username,
    name: user.name,
    businessName: user.businessName,
    createdAt: user.createdAt,
  };
});
