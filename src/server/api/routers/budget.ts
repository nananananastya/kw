import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const budgetRouter = createTRPCRouter({
  getUserBudgets: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.budget.findMany({
      where: {
        users: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
    });
  }),

  createBudget: protectedProcedure
    .input(z.object({ name: z.string(), amount: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.budget.create({
        data: {
          name: input.name,
          amount: input.amount ?? 0, // если не передано — будет 0
          users: {
            create: {
              userId: ctx.session.user.id,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string(), amount: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const budget = await ctx.db.budget.create({
        data: {
          name: input.name,
          amount: input.amount ?? 0,
        },
      });

      await ctx.db.budgetUser.create({
        data: {
          userId: ctx.session.user.id,
          budgetId: budget.id,
        },
      });

      return budget;
    }),
});
