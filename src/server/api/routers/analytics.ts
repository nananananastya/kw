import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { CategoryType } from "@prisma/client";

export const analyticsRouter = createTRPCRouter({
  // 1) Сводка по пользовательским статистикам за последний месяц
  getSummaryStatistics: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      const now = new Date();
      const endISO = now.toISOString();
      const start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      const startISO = start.toISOString();

      // Средний расход
      const avgExpenseP = ctx.db.transaction.aggregate({
        _avg: { amount: true },
        where: {
          userId,
          date: { lte: endISO },
          category: { type: CategoryType.EXPENSE },
        },
      });
      // Максимальный расход
      const maxExpenseP = ctx.db.transaction.aggregate({
        _max: { amount: true },
        where: {
          userId,
          date: { gte: startISO, lte: endISO },
          category: { type: CategoryType.EXPENSE },
        },
      });
      // Сумма доходов
      const sumIncomeP = ctx.db.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          date: { gte: startISO, lte: endISO },
          category: { type: CategoryType.INCOME },
        },
      });
      // Сумма расходов
      const sumExpenseP = ctx.db.transaction.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          date: { gte: startISO, lte: endISO },
          category: { type: CategoryType.EXPENSE },
        },
      });

      const [avgRes, maxRes, incRes, expRes] = await Promise.all([
        avgExpenseP,
        maxExpenseP,
        sumIncomeP,
        sumExpenseP,
      ]);

      const avg = avgRes._avg.amount ?? 0;
      const max = maxRes._max.amount ?? 0;
      const income = incRes._sum.amount  ?? 0;
      const expense= expRes._sum.amount  ?? 1; // чтобы не делить на 0

      return {
        averageExpenses:    avg,
        largestExpenses:    max,
        incomeExpenseRatio: income / expense,
      };
    }),

  getCategoryAnalyticsByBudget: protectedProcedure
  .input(z.object({
    budgetId:  z.string(),
    period:    z.enum(["allTime", "lastMonth", "custom"]),
    startDate: z.string().optional(),
    endDate:   z.string().optional(),
  }))
  .query(async ({ ctx, input }) => {
    const { budgetId, period, startDate, endDate } = input;

    // Фильтр по дате
    let dateFilter: { gte?: Date; lte?: Date } = {};
    if (period === "lastMonth") {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      dateFilter.gte = d;
    } else if (period === "custom" && startDate && endDate) {
      dateFilter.gte = new Date(startDate);
      dateFilter.lte = new Date(endDate);
    }

    // Получаем все категории — доходы и расходы
    const categories = await ctx.db.category.findMany({
      where: {
        budgetId,
      },
      include: {
        transactions: {
          where: "gte" in dateFilter || "lte" in dateFilter
            ? { date: dateFilter }
            : {},
        },
      },
    });

    // Возвращаем категории с type
    return categories.map(c => ({
      category: c.name,
      value:    c.transactions.reduce((sum, t) => sum + t.amount, 0),
      type:     c.type, // теперь есть и 'INCOME', и 'EXPENSE'
    }));
  }),



  // 3) Динамика доходов/расходов по бюджету для графика
  getIncomeExpenseByBudget: protectedProcedure
    .input(z.object({
      budgetId:  z.string(),
      period:    z.enum(["allTime", "lastMonth", "custom"]).optional(),
      startDate: z.string().optional(),
      endDate:   z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { budgetId, period, startDate, endDate } = input;
      let dateFilter: { gte?: Date; lte?: Date } = {};

      if (period === "lastMonth") {
        const to = new Date();
        const from = new Date();
        from.setMonth(from.getMonth() - 1);
        dateFilter = { gte: from, lte: to };
      } else if (period === "custom" && startDate && endDate) {
        dateFilter = { gte: new Date(startDate), lte: new Date(endDate) };
      }

      const txs = await ctx.db.transaction.findMany({
        where: {
          budgetId,
          ...("gte" in dateFilter || "lte" in dateFilter
             ? { date: dateFilter }
             : {}),
        },
        select: {
          date:     true,
          amount:   true,
          category: { select: { type: true } },
        },
      });

      // Группируем по дате и типу категории
      const grouped: Record<string, { income: number; expense: number }> = {};
      for (const t of txs) {
        const key = t.date.toISOString().slice(0, 10);
        if (!grouped[key])                            grouped[key] = { income: 0, expense: 0 };
        if (t.category.type === CategoryType.INCOME)  grouped[key].income  += t.amount;
        else                                          grouped[key].expense += t.amount;
      }

      return Object.entries(grouped).map(([date, { income, expense }]) => ({
        date, income, expense,
      }));
    }),
});
