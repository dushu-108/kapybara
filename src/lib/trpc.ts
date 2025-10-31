import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from './db';

// Create tRPC context
export const createTRPCContext = async () => {
  return {
    db,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware for input validation
export const validatedProcedure = publicProcedure.use(async ({ next, input }) => {
  // Add any global validation logic here
  return next({ input });
});