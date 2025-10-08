import { protectedProcedure } from '../../../create-context';

export default protectedProcedure.query(async ({ ctx }) => {
  const { data, error } = await ctx.supabase
    .from('activities')
    .select('*')
    .eq('organization_id', ctx.organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('שגיאה בטעינת פעילויות');
  }

  return (data || []).map((item) => ({
    id: item.id,
    organizationId: item.organization_id,
    type: item.type,
    description: item.description,
    amount: item.amount ? Number(item.amount) : undefined,
    relatedId: item.related_id || undefined,
    createdBy: item.created_by,
    createdAt: item.created_at,
  }));
});
