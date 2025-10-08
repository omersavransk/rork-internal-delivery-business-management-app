import { protectedProcedure } from '../../../create-context';

export default protectedProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('income')
    .select('*')
    .eq('organization_id', ctx.organizationId)
    .order('date', { ascending: false });

  if (error) {
    throw new Error('שגיאה בטעינת הכנסות');
  }

  return (data || []).map((item) => ({
    id: item.id,
    organizationId: item.organization_id,
    amount: Number(item.amount),
    description: item.description || '',
    date: item.date,
    createdBy: item.created_by,
    createdAt: item.created_at,
  }));
});
