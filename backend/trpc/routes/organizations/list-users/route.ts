import { protectedProcedure } from '../../../create-context';

export default protectedProcedure
  .query(async ({ ctx }) => {
    const { data: orgUsers, error: orgUsersError } = await ctx.supabase
      .from('organization_users')
      .select('user_id, role')
      .eq('organization_id', ctx.organizationId);

    if (orgUsersError || !orgUsers) {
      throw new Error('שגיאה בטעינת משתמשים');
    }

    const userIds = orgUsers.map(ou => ou.user_id);

    const { data: users, error: usersError } = await ctx.supabase
      .from('users')
      .select('id, email, name, created_at')
      .in('id', userIds);

    if (usersError || !users) {
      throw new Error('שגיאה בטעינת משתמשים');
    }

    return users.map(user => {
      const orgUser = orgUsers.find(ou => ou.user_id === user.id);
      return {
        id: user.id,
        organizationId: ctx.organizationId,
        email: user.email,
        name: user.name,
        role: orgUser?.role || 'member',
        createdAt: user.created_at,
      };
    });
  });
