import { protectedProcedure } from '../../../create-context';

export default protectedProcedure.query(async ({ ctx }) => {
  const { data: user, error: userError } = await ctx.supabase
    .from('users')
    .select('*')
    .eq('id', ctx.userId)
    .single();

  if (userError || !user) {
    throw new Error('משתמש לא נמצא');
  }

  const { data: orgUser, error: orgUserError } = await ctx.supabase
    .from('organization_users')
    .select('role')
    .eq('organization_id', ctx.organizationId)
    .eq('user_id', ctx.userId)
    .single();

  if (orgUserError || !orgUser) {
    throw new Error('משתמש לא שייך לארגון');
  }

  const { data: organization, error: orgError } = await ctx.supabase
    .from('organizations')
    .select('*')
    .eq('id', ctx.organizationId)
    .single();

  if (orgError || !organization) {
    throw new Error('ארגון לא נמצא');
  }

  return {
    id: user.id,
    organizationId: ctx.organizationId,
    email: user.email,
    name: user.name,
    role: orgUser.role,
    createdAt: user.created_at,
    organization: {
      id: organization.id,
      name: organization.name,
      createdAt: organization.created_at,
    },
  };
});
