import { protectedProcedure } from '../../../create-context';
import { z } from 'zod';

export default protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      phone: z.string().optional(),
      pricePerDelivery: z.number().min(0).optional(),
      isActive: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...updates } = input;

    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.pricePerDelivery !== undefined) updateData.price_per_delivery = updates.pricePerDelivery;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await ctx.supabase
      .from('couriers')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', ctx.organizationId)
      .select()
      .single();

    if (error || !data) {
      throw new Error('שגיאה בעדכון שליח');
    }

    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      phone: data.phone || '',
      pricePerDelivery: Number(data.price_per_delivery || 0),
      balance: Number(data.balance || 0),
      isActive: data.is_active ?? true,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  });
