import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '@/lib/trpc';
import { appRouter } from '@/server/routers/_app';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError: ({ path, error, type, input }) => {
      console.error(`❌ tRPC failed on ${path ?? '<no-path>'}:`, {
        message: error.message,
        code: error.code,
        cause: error.cause,
        type,
        input,
        stack: error.stack,
      });
    },
  });

export { handler as GET, handler as POST };