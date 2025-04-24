import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

// Здесь будет добавлен новый запрос, который получает данные по доходам и расходам за выбранный период и бюджет
export const analyticsRouter = createTRPCRouter({
  getSummaryStatistics: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;

      // Получаем текущую дату
      const currentDate = new Date();
      
      // Рассчитываем начало и конец периода (за последний месяц)
      const endDate = currentDate.toISOString(); // Сегодня
      const startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 1); // 1 месяц назад
      const startDateISO = startDate.toISOString();

      // Выполняем агрегирование с фильтрацией по датам
      const [averageExpenses, largestExpenses, incomeSum, expenseSum] = await Promise.all([
        ctx.db.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            date: {
              gte: startDateISO, // Начало периода
              lte: endDate, // Конец периода
            },
          },
          _avg: { amount: true },
        }),
        ctx.db.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            date: {
              gte: startDateISO, 
              lte: endDate,
            },
          },
          _max: { amount: true },
        }),
        ctx.db.transaction.aggregate({
          where: {
            userId,
            type: 'INCOME',
            date: {
              gte: startDateISO,
              lte: endDate,
            },
          },
          _sum: { amount: true },
        }),
        ctx.db.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            date: {
              gte: startDateISO,
              lte: endDate,
            },
          },
          _sum: { amount: true },
        }),
      ]);

      const avg = averageExpenses._avg.amount ?? 0;
      const max = largestExpenses._max.amount ?? 0;
      const income = incomeSum._sum.amount ?? 0;
      const expense = expenseSum._sum.amount ?? 1; // Чтобы избежать деления на ноль

      return {
        averageExpenses: avg,
        largestExpenses: max,
        incomeExpenseRatio: income / expense,
      };
    }),

    getCategoryAnalyticsByBudget: protectedProcedure
    .input(
      z.object({
        budgetId: z.string(),
        period: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { budgetId, period, startDate, endDate } = input;
  
      // Фильтр по дате
      let dateFilter = {};
      if (period === 'lastMonth') {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        dateFilter = { date: { gte: lastMonth } };
      } else if (period === 'custom' && startDate && endDate) {
        dateFilter = {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        };
      }
  
      // Получаем все категории с их транзакциями типа EXPENSE
      const categories = await ctx.db.category.findMany({
        where: { budgetId },
        include: {
          transactions: {
            where: {
              ...dateFilter,
              type: 'EXPENSE',
            },
          },
        },
      });
  
      // Формируем итоговую аналитику по категориям
      return categories.map((category) => ({
        category: category.name,
        value: category.transactions.reduce((sum, t) => sum + t.amount, 0),
      }));
    }),
  
  
  

  getIncomeExpenseByBudget: protectedProcedure
  .input(
    z.object({
      budgetId: z.string(),
      period: z.enum(["allTime", "lastMonth", "custom"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    let dateFilter: { date: { gte?: Date; lte?: Date } } = { date: {} };

    if (input.period === "lastMonth") {
      const today = new Date();
      const lastMonth = new Date(today.setMonth(today.getMonth() - 1)); // Получаем дату месяца назад
      dateFilter = {
        date: {
          gte: lastMonth, // Период с месяца назад
          lte: new Date(), // До текущей даты
        },
      };
    } else if (input.period === "custom" && input.startDate && input.endDate) {
      dateFilter = {
        date: {
          gte: new Date(input.startDate), // Период с выбранной даты "от"
          lte: new Date(input.endDate),   // До выбранной даты "до"
        },
      };
    }

    const transactions = await ctx.db.transaction.findMany({
      where: {
        budgetId: input.budgetId,
        ...dateFilter, // Применяем фильтрацию по датам
      },
      select: {
        date: true,
        type: true,
        amount: true,
      },
    });

    // Группировка по дате и агрегация доходов/расходов
    const grouped: Record<string, { income: number; expense: number }> = {};

    for (const tx of transactions) {
      const dateKey = tx.date.toISOString().split("T")[0] || '';

      if (!grouped[dateKey]) {
        grouped[dateKey] = { income: 0, expense: 0 };
      }

      if (tx.type === "INCOME") grouped[dateKey].income += tx.amount;
      if (tx.type === "EXPENSE") grouped[dateKey].expense += tx.amount;
    }

    return Object.entries(grouped).map(([date, { income, expense }]) => ({
      date,
      income,
      expense,
    }));
  }),


});