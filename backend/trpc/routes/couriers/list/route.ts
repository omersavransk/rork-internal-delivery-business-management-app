import { protectedProcedure } from '../../../create-context';

export default protectedProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('couriers')
    .select('*')
    .eq('organization_id', ctx.organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('שגיאה בטעינת שליחים');
  }

  return (data || []).map((item) => ({
    id: item.id,
    organizationId: item.organization_id,
    name: item.name,
    phone: item.phone || '',
    pricePerDelivery: Number(item.price_per_delivery || 0),
    balance: Number(item.balance || 0),
    isActive: item.is_active ?? true,
    createdBy: item.created_by,
    createdAt: item.created_at,
  }));
});
