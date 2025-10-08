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
    const { data: newExpense, error: expenseError } = await ctx.supabase
      .from('expenses')
      .insert({
        organization_id: ctx.organizationId,
        amount: input.amount,
        description: input.description,
        date: input.date,
        created_by: ctx.userId,
      })
      .select()
      .single();

    if (expenseError || !newExpense) {
      throw new Error('שגיאה ביצירת הוצאה');
    }

    const { error: activityError } = await ctx.supabase
      .from('activities')
      .insert({
        organization_id: ctx.organizationId,
        type: 'expense',
        description: input.description,
        amount: input.amount,
        related_id: newExpense.id,
        created_by: ctx.userId,
      });

    if (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    return {
      id: newExpense.id,
      organizationId: newExpense.organization_id,
      amount: Number(newExpense.amount),
      description: newExpense.description || '',
      date: newExpense.date,
      createdBy: newExpense.created_by,
      createdAt: newExpense.created_at,
    };
  });
