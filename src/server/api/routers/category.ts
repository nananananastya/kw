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

  getCategoriesByBudgetAndType: protectedProcedure
    .input(z.object({
  budgetId: z.string(),
  type: z.enum(['INCOME', 'EXPENSE']),
  page: z.number().min(1).optional().default(1),
  size: z.number().min(1).max(100).optional().default(10),
}))
.query(async ({ ctx, input }) => {
  const skip = (input.page - 1) * input.size;
  const take = input.size;

  // Сначала считаем общее кол-во категорий для пагинации
  const total = await ctx.db.category.count({
    where: {
      budgetId: input.budgetId,
      type: input.type,
    },
  });

  // Получаем категории с лимитом и пропуском
  const categories = await ctx.db.category.findMany({
    where: {
      budgetId: input.budgetId,
      type: input.type,
    },
    skip,
    take,
    select: {
      id: true,
      name: true,
      limit: true,
      type: true,
      budgetId: true,
    },
  });

  // Группировка spent как было
  const spentData = await ctx.db.transaction.groupBy({
    by: ['categoryId'],
    where: {
      categoryId: { in: categories.map(c => c.id) },
    },
    _sum: { amount: true },
  });

  const categoriesWithSpent = categories.map(category => {
    const spentEntry = spentData.find(s => s.categoryId === category.id);
    return {
      ...category,
      spent: spentEntry?._sum.amount ?? 0,
    };
  });

  return {
    categories: categoriesWithSpent,
    total,
  };
}),


    // Добавление новой категории в бюджет
addCategoryToBudget: protectedProcedure
  .input(
    z.object({
      name: z.string(),
      limit: z.number(),
      budgetId: z.string(),
      type: z.enum(['INCOME', 'EXPENSE']),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { name, limit, budgetId, type } = input;

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
        type,
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
        return { error: "Что-то пошло не так" };
    }
    }),


});