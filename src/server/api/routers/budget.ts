import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { startOfMonth } from "date-fns";
import { requireBudgetOwner } from '~/server/utils/checkRole';

export const budgetRouter = createTRPCRouter({
  // Получаем все бюджеты, связанные с пользователем
  getUserBudgets: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
  
    const budgets = await ctx.db.budget.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: {
          where: { userId },
          select: { role: true },
        },
      },
    });
  
    // Возвращаем данные с ролью пользователя в каждом бюджете
    return budgets.map((budget) => ({
      ...budget,
      userRole: budget.users[0]?.role ?? null,
    }));
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
          role: 'OWNER',
        },
      });

      return budget;
    }),

 // Приглашаем пользователя в бюджет
 inviteToBudget: protectedProcedure
 .input(z.object({ email: z.string(), budgetId: z.string() }))
 .mutation(async ({ ctx, input }) => {
   const { email, budgetId } = input;

   try {
     await requireBudgetOwner({
       db: ctx.db,
       userId: ctx.session.user.id,
       budgetId,
     });
   } catch (err) {
     return { error: (err as Error).message };
   }

   const user = await ctx.db.user.findUnique({ where: { email } });
   if (!user) {
     return { error: "Пользователь с таким email не найден" };
   }

   const existing = await ctx.db.budgetUser.findFirst({
     where: { userId: user.id, budgetId },
   });

   if (existing) {
     return { error: "Пользователь уже добавлен в этот бюджет" };
   }

   await ctx.db.budgetUser.create({
     data: {
       userId: user.id,
       budgetId,
       role: "MEMBER",
     },
   });

   return { message: "Пользователь успешно добавлен в бюджет" };
 }),

 
 deleteBudget: protectedProcedure
 .input(z.object({ budgetId: z.string() }))
 .mutation(async ({ ctx, input }) => {
   const { budgetId } = input;

   const budget = await ctx.db.budget.findUnique({
     where: { id: budgetId },
   });

   if (!budget) {
     return { error: "Бюджет не найден" };
   }

   try {
     await requireBudgetOwner({
       db: ctx.db,
       userId: ctx.session.user.id,
       budgetId,
     });
   } catch (err) {
     return { error: (err as Error).message };
   }

   await ctx.db.transaction.deleteMany({ where: { budgetId } });
   await ctx.db.category.deleteMany({ where: { budgetId } });
   await ctx.db.budgetUser.deleteMany({ where: { budgetId } });
   await ctx.db.budget.delete({ where: { id: budgetId } });

   return { message: "Бюджет успешно удалён" };
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

    // редактирование категории
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
  
  // удаление категории
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


    getCategoriesWithExpenses: protectedProcedure
    .input(z.string()) // budgetId
    .query(async ({ ctx, input: budgetId }) => {
      const startDate = startOfMonth(new Date());
  
      // Получаем все категории, независимо от наличия транзакций
      const categories = await ctx.db.category.findMany({
        where: { budgetId },
        include: {
          transactions: {
            where: {
              type: 'EXPENSE',
              date: {
                gte: startDate, // только транзакции начиная с начала месяца
              },
            },
          },
        },
      });
  
      // Маппируем категории и добавляем транзакции, если они есть
      return categories.map((category) => {
        // Если транзакции есть, считаем потраченные средства, если нет — ставим 0
        const spent = category.transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
        return {
          id: category.id,
          name: category.name,
          limit: category.limit,
          spent,
          budgetId: category.budgetId, // добавляем для EditCategoryModal
        };
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

// Добавление денег в цель пользователя
addAmountToGoal: protectedProcedure
  .input(
    z.object({
      goalId: z.string(),  
      amountToAdd: z.number().min(0), 
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { goalId, amountToAdd } = input;

    const updatedGoal = await ctx.db.goal.update({
      where: { id: goalId },  
      data: {
        currentAmount: {
          increment: amountToAdd, 
        },
      },
    });

    return updatedGoal;
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

  getBudgetMembers: protectedProcedure
  .input(z.object({ budgetId: z.string() }))
  .query(async ({ input, ctx }) => {
    return await ctx.db.budgetUser.findMany({
      where: { budgetId: input.budgetId },
      include: { user: true },
    });
  }),

  removeUserFromBudget: protectedProcedure
  .input(z.object({ budgetId: z.string(), userId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // Проверка, что текущий пользователь - владелец бюджета
    await requireBudgetOwner({
      db: ctx.db,
      userId: ctx.session.user.id, // Берем ID текущего пользователя из сессии
      budgetId: input.budgetId,
    });

    // Если проверка прошла успешно, удаляем пользователя из бюджета
    return await ctx.db.budgetUser.deleteMany({
      where: {
        budgetId: input.budgetId,
        userId: input.userId,
      },
    });
  }),

});