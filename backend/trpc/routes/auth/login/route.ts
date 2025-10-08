import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export default publicProcedure
  .input(
    z.object({
      organizationId: z.string(),
      email: z.string().email(),
      password: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { data: user, error: userError } = await ctx.supabase
      .from('users')
      .select('*')
      .eq('email', input.email)
      .single();

    if (userError || !user) {
      throw new Error('מייל או סיסמה שגויים');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password_hash);
    if (!passwordMatch) {
      throw new Error('מייל או סיסמה שגויים');
    }

    const { data: orgUser, error: orgUserError } = await ctx.supabase
      .from('organization_users')
      .select('role')
      .eq('organization_id', input.organizationId)
      .eq('user_id', user.id)
      .single();

    if (orgUserError || !orgUser) {
      throw new Error('משתמש לא שייך לארגון זה');
    }

    return {
      id: user.id,
      organizationId: input.organizationId,
      email: user.email,
      name: user.name,
      role: orgUser.role,
      createdAt: user.created_at,
      token: `${input.organizationId}:${user.id}`,
    };
  });
