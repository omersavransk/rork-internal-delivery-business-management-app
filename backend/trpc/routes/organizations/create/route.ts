import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export default publicProcedure
  .input(
    z.object({
      organizationName: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { data: existingUser } = await ctx.supabase
      .from('users')
      .select('id')
      .eq('email', input.email)
      .single();

    if (existingUser) {
      throw new Error('המייל כבר קיים במערכת');
    }

    const { data: newOrganization, error: orgError } = await ctx.supabase
      .from('organizations')
      .insert({
        name: input.organizationName,
      })
      .select()
      .single();

    if (orgError || !newOrganization) {
      throw new Error('שגיאה ביצירת ארגון');
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
        organization_id: newOrganization.id,
        user_id: newUser.id,
        role: 'owner',
      });

    if (orgUserError) {
      throw new Error('שגיאה בהוספת משתמש לארגון');
    }

    return {
      organization: {
        id: newOrganization.id,
        name: newOrganization.name,
        createdAt: newOrganization.created_at,
      },
      user: {
        id: newUser.id,
        organizationId: newOrganization.id,
        email: newUser.email,
        name: newUser.name,
        role: 'owner' as const,
        createdAt: newUser.created_at,
        token: `${newOrganization.id}:${newUser.id}`,
      },
    };
  });
