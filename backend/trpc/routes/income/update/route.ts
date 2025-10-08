import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';

export default protectedProcedure
  .input(
    z.object({
      id: z.string(),
      amount: z.number().positive().optional(),
      description: z.string().optional(),
      date: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...updates } = input;

    const updateData: Record<string, unknown> = {};
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) updateData.date = updates.date;

    const { data, error } = await ctx.supabase
      .from('income')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', ctx.organizationId)
      .select()
      .single();

    if (error || !data) {
      throw new Error('שגיאה בעדכון הכנסה');
    }

    return {
      id: data.id,
      organizationId: data.organization_id,
      amount: Number(data.amount),
      description: data.description || '',
      date: data.date,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  });
