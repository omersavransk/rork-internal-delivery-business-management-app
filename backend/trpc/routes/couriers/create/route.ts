import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';

export default protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      phone: z.string(),
      pricePerDelivery: z.number().min(0),
      isActive: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { data: newCourier, error: courierError } = await ctx.supabase
      .from('couriers')
      .insert({
        organization_id: ctx.organizationId,
        name: input.name,
        phone: input.phone,
        price_per_delivery: input.pricePerDelivery,
        balance: 0,
        is_active: input.isActive ?? true,
        created_by: ctx.userId,
      })
      .select()
      .single();

    if (courierError || !newCourier) {
      throw new Error('שגיאה ביצירת שליח');
    }

    const { error: activityError } = await ctx.supabase
      .from('activities')
      .insert({
        organization_id: ctx.organizationId,
        type: 'courier_added',
        description: `שליח חדש נוסף: ${input.name}`,
        related_id: newCourier.id,
        created_by: ctx.userId,
      });

    if (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    return {
      id: newCourier.id,
      organizationId: newCourier.organization_id,
      name: newCourier.name,
      phone: newCourier.phone || '',
      pricePerDelivery: Number(newCourier.price_per_delivery || 0),
      balance: Number(newCourier.balance || 0),
      isActive: newCourier.is_active ?? true,
      createdBy: newCourier.created_by,
      createdAt: newCourier.created_at,
    };
  });
