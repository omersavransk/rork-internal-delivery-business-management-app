import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';

export default protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const { data: courier } = await ctx.supabase
      .from('couriers')
      .select('name')
      .eq('id', input.id)
      .eq('organization_id', ctx.organizationId)
      .single();

    const { error } = await ctx.supabase
      .from('couriers')
      .delete()
      .eq('id', input.id)
      .eq('organization_id', ctx.organizationId);

    if (error) {
      throw new Error('שגיאה במחיקת שליח');
    }

    if (courier) {
      const { error: activityError } = await ctx.supabase
        .from('activities')
        .insert({
          organization_id: ctx.organizationId,
          type: 'courier_deleted',
          description: `שליח נמחק: ${courier.name}`,
          related_id: input.id,
          created_by: ctx.userId,
        });

      if (activityError) {
        console.error('Failed to create activity:', activityError);
      }
    }

    return { success: true };
  });
