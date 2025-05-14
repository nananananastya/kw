import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { startOfMonth } from "date-fns";
import { requireBudgetOwner } from '~/server/utils/checkRole';

export const categoryRouter = createTRPCRouter({
    // Получение категории для выбранного бюджета
  getCategoriesByBudget: protectedProcedure
    .input(z.object({ budgetId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.category.findMany({
        where: {
          budgetId: input.budgetId,
        },
      });
    }),

    // Добавление новой категории в бюджет
    addCategoryToBudget: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        limit: z.number(),
        budgetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, limit, budgetId } = input;
  
      await requireBudgetOwner({
        db: ctx.db,
        userId: ctx.session.user.id,
        budgetId,
      });
  
      const category = await ctx.db.category.create({
        data: {
          name,
          limit,
          budgetId,
        },
      });
  
      return category;
    }),

    // Редактирование категории
    updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        limit: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const category = await ctx.db.category.findUnique({
          where: { id: input.id },
          select: { budgetId: true },
        });
  
        if (!category) {
          return { error: "Категория не найдена" };
        }
  
        await requireBudgetOwner({
          db: ctx.db,
          userId: ctx.session.user.id,
          budgetId: category.budgetId,
        });
  
        await ctx.db.category.update({
          where: { id: input.id },
          data: {
            name: input.name,
            limit: input.limit,
          },
        });
  
        return { message: "Категория обновлена" };
      } catch (err) {
        return { error: (err as Error).message };
      }
    }),  
  
    // Удаление категории
    deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
    try {
        const category = await ctx.db.category.findUnique({
        where: { id: input.id },
        select: { budgetId: true },
        });

        if (!category) {
        return { error: "Категория не найдена" };
        }

        await requireBudgetOwner({
        db: ctx.db,
        userId: ctx.session.user.id,
        budgetId: category.budgetId,
        });

        await ctx.db.category.delete({
        where: { id: input.id },
        });

        return { message: "Категория успешно удалёна" };
    } catch (err) {
        return { error: (err as Error).message };
    }
    }),

    // Получение категорий с расходами
    getCategoriesWithExpenses: protectedProcedure
    .input(z.string()) // budgetId
    .query(async ({ ctx, input: budgetId }) => {
      const startDate = startOfMonth(new Date());
  
      const categories = await ctx.db.category.findMany({
        where: { budgetId },
        include: {
          transactions: {
            where: {
              type: 'EXPENSE',
              date: {
                gte: startDate, 
              },
            },
          },
        },
      });
  
      return categories.map((category) => {
        const spent = category.transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
        return {
          id: category.id,
          name: category.name,
          limit: category.limit,
          spent,
          budgetId: category.budgetId,
        };
      });
    }),
});