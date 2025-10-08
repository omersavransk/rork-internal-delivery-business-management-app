import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';

export default protectedProcedure
  .input(
    z.object({
      amount: z.number().positive(),
      description: z.string(),
      date: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { data: newIncome, error: incomeError } = await ctx.supabase
      .from('income')
      .insert({
        organization_id: ctx.organizationId,
        amount: input.amount,
        description: input.description,
        date: input.date,
        created_by: ctx.userId,
      })
      .select()
      .single();

    if (incomeError || !newIncome) {
      throw new Error('שגיאה ביצירת הכנסה');
    }

    const { error: activityError } = await ctx.supabase
      .from('activities')
      .insert({
        organization_id: ctx.organizationId,
        type: 'income',
        description: input.description,
        amount: input.amount,
        related_id: newIncome.id,
        created_by: ctx.userId,
      });

    if (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    return {
      id: newIncome.id,
      organizationId: newIncome.organization_id,
      amount: Number(newIncome.amount),
      description: newIncome.description || '',
      date: newIncome.date,
      createdBy: newIncome.created_by,
      createdAt: newIncome.created_at,
    };
  });
