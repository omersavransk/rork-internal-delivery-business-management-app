import { protectedProcedure } from '../../../create-context';

export default protectedProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('deliveries')
    .select('*')
    .eq('organization_id', ctx.organizationId)
    .order('date', { ascending: false });

  if (error) {
    throw new Error('שגיאה בטעינת משלוחים');
  }

  return (data || []).map((item) => ({
    id: item.id,
    organizationId: item.organization_id,
    courierId: item.courier_id,
    quantity: item.quantity,
    totalAmount: Number(item.total_amount),
    date: item.date,
    notes: item.notes || undefined,
    createdBy: item.created_by,
    createdAt: item.created_at,
  }));
});
