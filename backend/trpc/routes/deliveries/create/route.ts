import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';

export default protectedProcedure
  .input(
    z.object({
      courierId: z.string(),
      quantity: z.number().int().positive(),
      totalAmount: z.number().positive(),
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

    const { data: newDelivery, error: deliveryError } = await ctx.supabase
      .from('deliveries')
      .insert({
        organization_id: ctx.organizationId,
        courier_id: input.courierId,
        quantity: input.quantity,
        total_amount: input.totalAmount,
        date: input.date,
        notes: input.notes,
        created_by: ctx.userId,
      })
      .select()
      .single();

    if (deliveryError || !newDelivery) {
      throw new Error('שגיאה ביצירת משלוח');
    }

    const newBalance = Number(courier.balance) + input.totalAmount;
    const { error: updateError } = await ctx.supabase
      .from('couriers')
      .update({ balance: newBalance })
      .eq('id', input.courierId)
      .eq('organization_id', ctx.organizationId);

    if (updateError) {
      console.error('Failed to update courier balance:', updateError);
    }

    const { error: activityError } = await ctx.supabase
      .from('activities')
      .insert({
        organization_id: ctx.organizationId,
        type: 'delivery',
        description: `${input.quantity} משלוחים לשליח ${courier.name}${input.notes ? ` - ${input.notes}` : ''}`,
        amount: input.totalAmount,
        related_id: newDelivery.id,
        created_by: ctx.userId,
      });

    if (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    return {
      id: newDelivery.id,
      organizationId: newDelivery.organization_id,
      courierId: newDelivery.courier_id,
      quantity: newDelivery.quantity,
      totalAmount: Number(newDelivery.total_amount),
      date: newDelivery.date,
      notes: newDelivery.notes || undefined,
      createdBy: newDelivery.created_by,
      createdAt: newDelivery.created_at,
    };
  });
