import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const budgetRouter = createTRPCRouter({
  // Получаем все бюджеты, связанные с пользователем
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

  // Создаём новый бюджет и добавляем текущего пользователя в него
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

  // Создаём новый бюджет, добавляем в него текущего пользователя
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

 // Приглашаем пользователя в бюджет
 inviteToBudget: protectedProcedure
 .input(z.object({ email: z.string(), budgetId: z.string() }))
 .mutation(async ({ ctx, input }) => {
   const { email, budgetId } = input;

   if (!budgetId) {
     return { error: 'Бюджет не выбран' };
   }

   const user = await ctx.db.user.findUnique({ where: { email } });
   if (!user) {
     return { error: 'Пользователь с таким email не найден' };
   }

   const existingBudgetUser = await ctx.db.budgetUser.findFirst({
     where: { userId: user.id, budgetId },
   });

   if (existingBudgetUser) {
     return { error: 'Пользователь уже добавлен в этот бюджет' };
   }

   await ctx.db.budgetUser.create({
     data: {
       userId: user.id,
       budgetId,
     },
   });

   return { message: 'Пользователь успешно добавлен в бюджет' };
 }),

  // Удаляем выбранный бюджет
  deleteBudget: protectedProcedure
    .input(z.object({ budgetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { budgetId } = input;

      // Проверка на наличие бюджета
      const budget = await ctx.db.budget.findUnique({
        where: { id: budgetId },
      });

      if (!budget) {
        return { error: "Бюджет не найден" }; // Если бюджет не найден
      }

      // Удаляем связи с пользователями (если есть)
      await ctx.db.budgetUser.deleteMany({
        where: {
          budgetId: budgetId,
        },
      });

      // Удаляем сам бюджет
      await ctx.db.budget.delete({
        where: { id: budgetId },
      });

      return { message: "Бюджет успешно удалён" }; // Сообщение об успешном удалении
    }),

  // Получить категории для выбранного бюджета
  getCategoriesForBudget: protectedProcedure
    .input(z.string()) // Получаем id бюджета в качестве входных данных
    .query(async ({ ctx, input }) => {
      console.log("Budget ID received:", input); // Логируем полученный budgetId
      const categories = await ctx.db.category.findMany({
        where: {
          budgetId: input, // Используем полученный id бюджета
        },
      });

      console.log("Categories for budget:", categories); // Логирование для отладки

      return categories; // Возвращаем найденные категории
    }),

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
  
      // Логика для добавления категории
      const category = await ctx.db.category.create({
        data: {
          name,
          limit,
          budgetId,
        },
      });
  
      return category; // Возвращаем созданную категорию
    }),

      updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        limit: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.update({
        where: { id: input.id },
        data: {
          name: input.name,
          limit: input.limit,
        },
      });
    }),

      deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.delete({
        where: { id: input.id },
      });
    }),

  // Получаем все цели пользователя
  getUserGoals: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.goal.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

// Добавление новой цели для пользователя
addGoal: protectedProcedure
  .input(
    z.object({
      name: z.string(),
      targetAmount: z.number(),
      currentAmount: z.number().optional(),
      targetDate: z.date(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const goal = await ctx.db.goal.create({
      data: {
        name: input.name,
        targetAmount: input.targetAmount,
        currentAmount: input.currentAmount ?? 0, // если не передано, ставим 0
        targetDate: input.targetDate,
        userId: ctx.session.user.id, // связываем цель с текущим пользователем
      },
    });

    return goal; // возвращаем созданную цель
  }),

  // Обновляем цель
  updateGoal: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        targetAmount: z.number(),
        currentAmount: z.number(),
        targetDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.goal.update({
        where: { id: input.id },
        data: {
          name: input.name,
          targetAmount: input.targetAmount,
          currentAmount: input.currentAmount,
          targetDate: input.targetDate,
        },
      });
    }),

    deleteGoal: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.goal.delete({
        where: { id: input.id },
      });
    }),
  
    // Получаем баланс, доходы и расходы по бюджету
getBudgetSummary: protectedProcedure
.input(z.object({ budgetId: z.string() }))
.query(async ({ ctx, input }) => {
  const { budgetId } = input;

  // Получаем все транзакции по бюджету
  const transactions = await ctx.db.transaction.findMany({
    where: {
      budgetId,
    },
  });

  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = await ctx.db.budget.findUnique({
    where: { id: budgetId },
    select: { amount: true },
  });

  return { balance: balance?.amount ?? 0, income, expense };
}),

// Пополнение бюджета
updateBudgetBalance: protectedProcedure
  .input(z.object({ budgetId: z.string(), amount: z.number().positive() }))
  .mutation(async ({ ctx, input }) => {
    const { budgetId, amount } = input;

    // Получаем текущий бюджет
    const budget = await ctx.db.budget.update({
      where: { id: budgetId },
      data: {
        amount: {
          increment: amount, // увеличиваем на указанную сумму
        },
      },
    });

    return budget;
  }),

// Снятие средств с бюджета
decreaseBudgetBalance: protectedProcedure
  .input(z.object({ budgetId: z.string(), amount: z.number().positive() }))
  .mutation(async ({ ctx, input }) => {
    const { budgetId, amount } = input;

    // Получаем текущий бюджет
    const budget = await ctx.db.budget.update({
      where: { id: budgetId },
      data: {
        amount: {
          decrement: amount, // уменьшаем на указанную сумму
        },
      },
    });

    return budget;
  }),


});
