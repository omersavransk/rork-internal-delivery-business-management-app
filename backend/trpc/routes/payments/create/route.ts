import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';

export default protectedProcedure
  .input(
    z.object({
      courierId: z.string(),
      amount: z.number().positive(),
      date: z.string(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { data: courier } = await ctx.supabase
      .from('couriers')
      .select('name, balance')
      .eq('id', input.courierId)
      .eq('organization_id', ctx.organizationId)
      .single();

    if (!courier) {
      throw new Error('שליח לא נמצא');
    }

    const { data: newPayment, error: paymentError } = await ctx.supabase
      .from('payments')
      .insert({
        organization_id: ctx.organizationId,
        courier_id: input.courierId,
        amount: input.amount,
        date: input.date,
        notes: input.notes,
        created_by: ctx.userId,
      })
      .select()
      .single();

    if (paymentError || !newPayment) {
      throw new Error('שגיאה ביצירת תשלום');
    }

    const newBalance = Number(courier.balance) - input.amount;
    const { error: updateError } = await ctx.supabase
      .from('couriers')
      .update({ balance: newBalance })
      .eq('id', input.courierId)
      .eq('organization_id', ctx.organizationId);

    if (updateError) {
      console.error('Failed to update courier balance:', updateError);
    }

    const { error: expenseError } = await ctx.supabase
      .from('expenses')
      .insert({
        organization_id: ctx.organizationId,
        amount: input.amount,
        description: `תשלום לשליח ${courier.name}${input.notes ? ` - ${input.notes}` : ''}`,
        date: input.date,
        created_by: ctx.userId,
      });

    if (expenseError) {
      console.error('Failed to create expense:', expenseError);
    }

    const { error: activityError } = await ctx.supabase
      .from('activities')
      .insert({
        organization_id: ctx.organizationId,
        type: 'payment',
        description: `תשלום לשליח ${courier.name}${input.notes ? ` - ${input.notes}` : ''}`,
        amount: input.amount,
        related_id: newPayment.id,
        created_by: ctx.userId,
      });

    if (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    return {
      id: newPayment.id,
      organizationId: newPayment.organization_id,
      courierId: newPayment.courier_id,
      amount: Number(newPayment.amount),
      date: newPayment.date,
      notes: newPayment.notes || undefined,
      createdBy: newPayment.created_by,
      createdAt: newPayment.created_at,
    };
  });
