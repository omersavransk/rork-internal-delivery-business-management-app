import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';

export default protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { error } = await ctx.supabase
      .from('expenses')
      .delete()
      .eq('id', input.id)
      .eq('organization_id', ctx.organizationId);

    if (error) {
      throw new Error('שגיאה במחיקת הוצאה');
    }

    return { success: true };
  });
