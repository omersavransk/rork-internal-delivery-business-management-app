import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export default protectedProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
      role: z.enum(['admin', 'member']),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { data: currentOrgUser } = await ctx.supabase
      .from('organization_users')
      .select('role')
      .eq('organization_id', ctx.organizationId)
      .eq('user_id', ctx.userId)
      .single();

    if (!currentOrgUser || (currentOrgUser.role !== 'owner' && currentOrgUser.role !== 'admin')) {
      throw new Error('אין לך הרשאה להוסיף משתמשים');
    }

    const { data: existingUser } = await ctx.supabase
      .from('users')
      .select('id')
      .eq('email', input.email)
      .single();

    if (existingUser) {
      throw new Error('המייל כבר קיים במערכת');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const { data: newUser, error: userError } = await ctx.supabase
      .from('users')
      .insert({
        email: input.email,
        password_hash: passwordHash,
        name: input.name,
      })
      .select()
      .single();

    if (userError || !newUser) {
      throw new Error('שגיאה ביצירת משתמש');
    }

    const { error: orgUserError } = await ctx.supabase
      .from('organization_users')
      .insert({
        organization_id: ctx.organizationId,
        user_id: newUser.id,
        role: input.role,
      });

    if (orgUserError) {
      throw new Error('שגיאה בהוספת משתמש לארגון');
    }

    return {
      id: newUser.id,
      organizationId: ctx.organizationId,
      email: newUser.email,
      name: newUser.name,
      role: input.role,
      createdAt: newUser.created_at,
    };
  });
