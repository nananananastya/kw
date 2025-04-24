import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { startOfWeek, endOfWeek } from 'date-fns';

export const homeRouter = createTRPCRouter({
    summary: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
      
        const budgets = await ctx.db.budgetUser.findMany({
          where: { userId },
          include: {
            budget: {
              include: {
                transactions: true,
              },
            },
          },
        });
      
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 }); // понедельник
        const end = endOfWeek(now, { weekStartsOn: 1 }); // воскресенье
      
        let totalBalance = 0;
        let totalIncome = 0;
        let totalExpenses = 0;
      
        for (const { budget } of budgets) {
          totalBalance += budget.amount ?? 0;
      
          for (const tx of budget.transactions) {
            if (tx.date >= start && tx.date <= end) {
              if (tx.type === 'INCOME') totalIncome += tx.amount;
              else if (tx.type === 'EXPENSE') totalExpenses += tx.amount;
            }
          }
        }
      
        return {
          totalBalance,
          totalIncome,
          totalExpenses,
        };
      }),      
});
