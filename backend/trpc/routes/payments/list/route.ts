import { protectedProcedure } from '../../../create-context';

export default protectedProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('payments')
    .select('*')
    .eq('organization_id', ctx.organizationId)
    .order('date', { ascending: false });

  if (error) {
    throw new Error('שגיאה בטעינת תשלומים');
  }

  return (data || []).map((item) => ({
    id: item.id,
    organizationId: item.organization_id,
    courierId: item.courier_id,
    amount: Number(item.amount),
    date: item.date,
    notes: item.notes || undefined,
    createdBy: item.created_by,
    createdAt: item.created_at,
  }));
});
