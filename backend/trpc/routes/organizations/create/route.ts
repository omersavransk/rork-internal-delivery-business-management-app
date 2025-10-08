import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import * as bcrypt from 'bcryptjs';

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
    console.log('[Create Org] Starting with input:', { organizationName: input.organizationName, email: input.email, name: input.name });
    
    const { data: existingUser, error: checkError } = await ctx.supabase
      .from('users')
      .select('id')
      .eq('email', input.email)
      .single();

    console.log('[Create Org] Existing user check:', { existingUser, checkError });

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

    console.log('[Create Org] Organization created:', { newOrganization, orgError });

    if (orgError || !newOrganization) {
      console.error('[Create Org] Failed to create organization:', orgError);
      throw new Error('שגיאה ביצירת ארגון: ' + (orgError?.message || 'Unknown error'));
    }

    console.log('[Create Org] Hashing password...');
    const passwordHash = await bcrypt.hash(input.password, 10);
    console.log('[Create Org] Password hashed successfully');

    const { data: newUser, error: userError } = await ctx.supabase
      .from('users')
      .insert({
        email: input.email,
        password_hash: passwordHash,
        name: input.name,
      })
      .select()
      .single();

    console.log('[Create Org] User created:', { newUser, userError });

    if (userError || !newUser) {
      console.error('[Create Org] Failed to create user:', userError);
      throw new Error('שגיאה ביצירת משתמש: ' + (userError?.message || 'Unknown error'));
    }

    const { error: orgUserError } = await ctx.supabase
      .from('organization_users')
      .insert({
        organization_id: newOrganization.id,
        user_id: newUser.id,
        role: 'owner',
      });

    console.log('[Create Org] Organization user link:', { orgUserError });

    if (orgUserError) {
      console.error('[Create Org] Failed to link user to organization:', orgUserError);
      throw new Error('שגיאה בהוספת משתמש לארגון: ' + (orgUserError?.message || 'Unknown error'));
    }

    const result = {
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
    
    console.log('[Create Org] Success! Returning result');
    return result;
  });
