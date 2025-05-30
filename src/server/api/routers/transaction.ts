import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { Prisma,  } from "@prisma/client"; 
import { canEditOrDeleteTransaction } from "~/server/utils/checkRole";

export const transactionRouter = createTRPCRouter({
// getUserTransactions: protectedProcedure
//   .input(
//     z.object({
//       page: z.coerce.number().min(1).default(1),
//       size: z.coerce.number().min(1).max(100).default(10),
//       startDate: z.coerce.date().optional(),
//       endDate: z.coerce.date().optional(),
//       budgetId: z.string().optional(),
//       categoryId: z.string().optional(),
//       type: z.nativeEnum(TransactionType).optional(),
//       sortBy: z.enum(['date', 'amount']).default('date'),
//       sortOrder: z.enum(['asc', 'desc']).default('desc'),
//     })
//   )
//   .query(async ({ ctx, input }) => {
//     const userId = ctx.session.user.id;
//     const {
//       page,
//       size,
//       startDate,
//       endDate,
//       budgetId,
//       categoryId,
//       type,
//       sortBy,
//       sortOrder,
//     } = input;

//     const userBudgetIds = await ctx.db.budgetUser.findMany({
//       where: { userId },
//       select: { budgetId: true },
//     });
//     const budgetIds = userBudgetIds.map((b) => b.budgetId);

//     const where: Prisma.TransactionWhereInput = {
//       budgetId: budgetId
//         ? { equals: budgetId }
//         : { in: budgetIds },

//       ...(categoryId && { categoryId }),
//       ...(type && { type }),
//       ...(startDate || endDate
//         ? {
//             date: {
//               ...(startDate ? { gte: startDate } : {}),
//               ...(endDate ? { lte: endDate } : {}),
//             },
//           }
//         : {}),
//     };

//     const [transactions, total] = await Promise.all([
//       ctx.db.transaction.findMany({
//         where,
//         include: {
//           category: true,
//           budget: true,
//           user: true,
//         },
//         orderBy: { [sortBy]: sortOrder },
//         skip: (page - 1) * size,
//         take: size,
//       }),
//       ctx.db.transaction.count({ where }),
//     ]);

//     return {
//       transactions,
//       total,
//     };
//   }),

// Создание транзакции
createTransaction: protectedProcedure
  .input(
    z.object({
      amount: z.number(),
      description: z.string().optional(),
      categoryId: z.string(),
      budgetId: z.string(),
      date: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const { amount, budgetId, categoryId, description, date } = input;

    const [budget, category] = await Promise.all([
      ctx.db.budget.findUnique({ where: { id: budgetId } }),
      ctx.db.category.findUnique({ where: { id: categoryId } }),
    ]);

    if (!budget || !category) {
      return { success: false, message: "Бюджет или категория не найдены" };
    }

    const signedAmount = category.type === "EXPENSE" ? -amount : amount;
    const newBudgetAmount = (budget.amount ?? 0) + signedAmount;

    if (newBudgetAmount < 0) {
      return { success: false, message: "Недостаточно средств в бюджете" };
    }

    try {
      const createdTransaction = await ctx.db.$transaction(async (prisma) => {
        const transaction = await prisma.transaction.create({
          data: {
            amount,
            description,
            categoryId,
            budgetId,
            date: new Date(date),
            userId,
          },
        });

        await prisma.budget.update({
          where: { id: budgetId },
          data: { amount: newBudgetAmount },
        });

        return { success: true, message: "Транзакция успешно добавлена", transaction };
      });

      return createdTransaction;

    } catch (error) {
      return { success: false, message: "Ошибка при добавлении транзакции" };
    }
  }),


//   // Изменение транзакции
//   updateTransaction: protectedProcedure
//   .input(
//     z.object({
//       transactionId: z.string(),
//       description: z.string().nullable(),
//       categoryId: z.string(),
//       amount: z.number(),
//       type: z.enum(["INCOME", "EXPENSE"]),
//       date: z.date(),
//     })
//   )
//   .mutation(async ({ ctx, input }) => {
//     const { db, session } = ctx;

//     try {
//       const old = await db.transaction.findUnique({
//         where: { id: input.transactionId },
//       });

//       if (!old) {
//         return {
//           success: false,
//           message: "Старая транзакция не найдена",
//         };
//       }

//       const result = await canEditOrDeleteTransaction({
//         db,
//         userId: session.user.id,
//         transactionId: input.transactionId,
//         actionType: 'update',
//       });

//       if (!result.success) {
//         return {
//           success: false,
//           message: result.message,
//         };
//       }

//       const deltaOld = old.type === "EXPENSE" ? old.amount : -old.amount;
//       const deltaNew = input.type === "EXPENSE" ? -input.amount : input.amount;
//       const totalDiff = deltaNew + deltaOld;

//       await db.budget.update({
//         where: { id: old.budgetId },
//         data: {
//           amount: {
//             increment: totalDiff,
//           },
//         },
//       });

//       const updatedTransaction = await db.transaction.update({
//         where: { id: input.transactionId },
//         data: {
//           description: input.description,
//           categoryId: input.categoryId,
//           amount: input.amount,
//           type: input.type,
//           date: input.date,
//         },
//       });

//       return {
//         success: true,
//         message: "Транзакция обновлена успешно",
//         data: updatedTransaction,
//       };
//     } catch (error) {
//       console.error("Error updating transaction:", error);
//       return {
//         success: false,
//         message:
//           error instanceof Error
//             ? error.message
//             : "Неизвестная ошибка при обновлении транзакции",
//       };
//     }
//   }),

//  //Удаление транзакции 
//   deleteTransaction: protectedProcedure
//   .input(z.object({ transactionId: z.string() }))
//   .mutation(async ({ ctx, input }) => {
//     try {
//       const canDeleteResult = await canEditOrDeleteTransaction({
//         db: ctx.db,
//         userId: ctx.session.user.id, 
//         transactionId: input.transactionId,
//         actionType: 'delete',
//       });


//       if (!canDeleteResult.success) {
//         return {
//           success: false,
//           message: canDeleteResult.message,
//         };
//       }

//       const fullTransaction = await ctx.db.transaction.findUnique({
//         where: { id: input.transactionId },
//         include: {
//           budget: true, 
//           category: true, 
//         },
//       });

//       if (!fullTransaction) {
//         return {
//           success: false,
//           message: "Транзакция не найдена",
//         };
//       }

//       const updatedBudgetAmount = fullTransaction.budget.amount ?? 0;
//       const updateBudget = {
//         amount: fullTransaction.type === 'INCOME'
//           ? updatedBudgetAmount - fullTransaction.amount
//           : updatedBudgetAmount + fullTransaction.amount,
//       };

//       const updatedCategoryAmount = fullTransaction.category.limit ?? 0;
//       const updateCategory: Prisma.CategoryUpdateInput = {
//         limit: fullTransaction.type === 'INCOME'
//           ? updatedCategoryAmount - fullTransaction.amount
//           : updatedCategoryAmount + fullTransaction.amount,
//       };

//       await ctx.db.budget.update({
//         where: { id: fullTransaction.budget.id },
//         data: updateBudget,
//       });

//       await ctx.db.category.update({
//         where: { id: fullTransaction.category.id },
//         data: updateCategory,
//       });

//       const deletedTransaction = await ctx.db.transaction.delete({
//         where: { id: input.transactionId },
//       });

//       return {
//         success: true,
//         message: "Транзакция удалена успешно",
//         data: deletedTransaction,
//       };
//     } catch (error) {
//       console.error("Error deleting transaction:", error);
//       return {
//         success: false,
//         message:
//           error instanceof Error
//             ? error.message
//             : "Неизвестная ошибка при удалении транзакции",
//       };
//     }
//   }),
});
