import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const transactionRouter = createTRPCRouter({
// server/api/routers/transaction.ts
getUserTransactions: protectedProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      size: z.number().min(1).max(100).default(10),
    })
  )
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const { page, size } = input;

    const userBudgetIds = await ctx.db.budgetUser.findMany({
      where: { userId },
      select: { budgetId: true },
    });
    const budgetIds = userBudgetIds.map((b) => b.budgetId);

    const [transactions, total] = await Promise.all([
      ctx.db.transaction.findMany({
        where: {
          budgetId: { in: budgetIds },
        },
        include: {
          category: true,
          budget: true,
          user: true,
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * size,
        take: size,
      }),
      ctx.db.transaction.count({
        where: {
          budgetId: { in: budgetIds },
        },
      }),
    ]);

    return {
      transactions,
      total,
    };
  }),

  

  // Запрос для получения категорий по бюджету
  getCategoriesByBudget: protectedProcedure
    .input(z.object({ budgetId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.category.findMany({
        where: {
          budgetId: input.budgetId,
        },
      });
    }),

  // Мутация для создания транзакции
  createTransaction: protectedProcedure
    .input(
      z.object({
        amount: z.number(),
        description: z.string().optional(),
        type: z.enum(["INCOME", "EXPENSE"]),
        categoryId: z.string(),
        budgetId: z.string(),
        date: z.string(), // ISO date string
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction.create({
        data: {
          amount: input.amount,
          description: input.description,
          type: input.type,
          categoryId: input.categoryId,
          budgetId: input.budgetId,
          date: new Date(input.date),
          userId: ctx.session.user.id,
        },
      });
    }),

// Мутация для обновления транзакции
updateTransaction: protectedProcedure
  .input(
    z.object({
      transactionId: z.string(),
      description: z.string().nullable(),
      categoryId: z.string(),
      amount: z.number(),
      type: z.enum(['INCOME', 'EXPENSE']),
    })
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const updatedTransaction = await ctx.db.transaction.update({
        where: { id: input.transactionId },
        data: {
          description: input.description,
          categoryId: input.categoryId,
          amount: input.amount,
          type: input.type,
        },
      });
      return { message: "Транзакция обновлена успешно", data: updatedTransaction };
    } catch (error) {
      throw new Error("Не удалось обновить транзакцию");
    }
  }),


    // Мутация для удаления транзакции
    deleteTransaction: protectedProcedure
      .input(z.object({ transactionId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const deletedTransaction = await ctx.db.transaction.delete({
            where: {
              id: input.transactionId,
            },
          });
          return { message: "Транзакция удалена успешно", data: deletedTransaction };
        } catch (error) {
          throw new Error("Не удалось удалить транзакцию");
        }
      }),

      
});
