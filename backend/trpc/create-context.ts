import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { supabase } from '@/lib/supabase';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  let userId: string | null = null;
  let organizationId: string | null = null;
  
  if (token) {
    const parts = token.split(':');
    if (parts.length === 2) {
      organizationId = parts[0];
      userId = parts[1];
    }
  }
  
  return {
    req: opts.req,
    token,
    userId,
    organizationId,
    supabase,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.token || !ctx.userId || !ctx.organizationId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId!,
      organizationId: ctx.organizationId!,
    },
  });
});
