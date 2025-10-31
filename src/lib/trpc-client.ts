import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // Add timeout and retry configuration
      fetch(url, options) {
        return fetch(url, {
          ...options,
          // Increase timeout for slow database connections
          signal: AbortSignal.timeout(30000), // 30 seconds
        });
      },
      async headers() {
        return {
          // authorization: getAuthCookie(),
        };
      },
    }),
  ],
});