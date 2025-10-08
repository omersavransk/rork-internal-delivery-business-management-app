import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';

export default publicProcedure
  .input(
    z.object({
      organizationId: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { data: orgExists } = await ctx.supabase
      .from('organizations')
      .select('id')
      .eq('id', input.organizationId)
      .single();

    if (!orgExists) {
      throw new Error('ארגון לא נמצא');
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
        organization_id: input.organizationId,
        user_id: newUser.id,
        role: 'member',
      });

    if (orgUserError) {
      throw new Error('שגיאה בהוספת משתמש לארגון');
    }

    return {
      id: newUser.id,
      organizationId: input.organizationId,
      email: newUser.email,
      name: newUser.name,
      role: 'member' as const,
      createdAt: newUser.created_at,
      token: `${input.organizationId}:${newUser.id}`,
    };
  });
