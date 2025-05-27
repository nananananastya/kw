import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { requireBudgetOwner } from '~/server/utils/checkRole';
import { startOfWeek, endOfWeek } from 'date-fns';

export const budgetRouter = createTRPCRouter({
  // Получение всех бюджетов, связанных с пользователем
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
    return budgets.map((budget) => ({
      ...budget,
      userRole: budget.users[0]?.role ?? null,
    }));
  }),
    
  // Создание бюджета, добавление в него текущего пользователя
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

  // Приглашение пользователя в бюджет
  inviteToBudget: protectedProcedure
  .input(z.object({ email: z.string(), budgetId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { email, budgetId } = input;

    try {
    // Проверка, что текущий пользователь - владелец бюджета
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

  // Удаление бюджета
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
    // Проверка, что текущий пользователь - владелец бюджета
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

    
  // Получение баланса, доходов и расходов по бюджету
  getBudgetSummary: protectedProcedure
  .input(z.object({ budgetId: z.string() }))
  .query(async ({ ctx, input }) => {
    const { budgetId } = input;

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

// Обновление баланса бюджета 
  changeBudgetBalance: protectedProcedure
    .input(
      z.object({
        budgetId: z.string(),
        amount: z.number().positive(),
        type: z.enum(["add", "subtract"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { budgetId, amount, type } = input;

      const budget = await ctx.db.budget.findUnique({
        where: { id: budgetId },
      });

      if (!budget) {
        return { error: "Бюджет не найден" };
      }

      if (type === "subtract") {
        if (budget.amount === null || budget.amount < amount) {
          return { error: "Недостаточно средств в бюджете" };
        }
      }

      const updatedBudget = await ctx.db.budget.update({
        where: { id: budgetId },
        data: {
          amount: {
            [type === "add" ? "increment" : "decrement"]: amount,
          },
        },
      });

      return {
        message:
          type === "add"
            ? "Бюджет успешно пополнен"
            : "Средства успешно списаны",
        budget: updatedBudget,
      };
    }),

    

  // Получение участников бюджета
  getBudgetMembers: protectedProcedure
  .input(z.object({ budgetId: z.string() }))
  .query(async ({ input, ctx }) => {
    return await ctx.db.budgetUser.findMany({
      where: { budgetId: input.budgetId },
      include: { user: true },
    });
  }),

  // Удаление пользователя из бюджета
  removeUserFromBudget: protectedProcedure
  .input(z.object({ budgetId: z.string(), userId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // Проверка, что текущий пользователь - владелец бюджета
    await requireBudgetOwner({
      db: ctx.db,
      userId: ctx.session.user.id, 
      budgetId: input.budgetId,
    });

    return await ctx.db.budgetUser.deleteMany({
      where: {
        budgetId: input.budgetId,
        userId: input.userId,
      },
    });
  }),

  // Получение данных для карточек на домашней странице
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
        const start = startOfWeek(now, { weekStartsOn: 1 }); 
        const end = endOfWeek(now, { weekStartsOn: 1 }); 
      
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