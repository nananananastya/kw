import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

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
    .input(z.object({ email: z.string().email(), budgetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { email, budgetId } = input;

      if (!budgetId) {
        return { error: 'Бюджет не выбран' }; // Сообщение, если бюджет не выбран
      }

      // Ищем пользователя по email
      const user = await ctx.db.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { error: 'Пользователь с таким email не найден' }; // Сообщение, если пользователь не найден
      }

      // Проверяем, не связан ли уже этот пользователь с этим бюджетом
      const existingBudgetUser = await ctx.db.budgetUser.findFirst({
        where: {
          userId: user.id,
          budgetId: budgetId,
        },
      });

      if (existingBudgetUser) {
        return { error: 'Пользователь уже добавлен в этот бюджет' }; // Сообщение, если пользователь уже добавлен
      }

      // Добавляем нового пользователя в таблицу budgetuser
      await ctx.db.budgetUser.create({
        data: {
          userId: user.id,
          budgetId: budgetId,
        },
      });

      return { message: 'Пользователь успешно добавлен в бюджет' }; // Сообщение об успехе
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
        return { error: 'Бюджет не найден' }; // Если бюджет не найден
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

      return { message: 'Бюджет успешно удалён' }; // Сообщение об успешном удалении
    }),
});
