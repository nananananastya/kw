import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { budgetRouter } from "./routers/budget";
import { transactionRouter } from "./routers/transaction";
import { analyticsRouter } from "./routers/analytics";
import { categoryRouter } from "./routers/category";
import { goalRouter } from "./routers/goal";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  budget: budgetRouter,
  transaction: transactionRouter,
  analytics: analyticsRouter,
  category: categoryRouter, 
  goal: goalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
