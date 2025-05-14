import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const goalRouter = createTRPCRouter({
    // Получение всех целей пользователя
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
            currentAmount: input.currentAmount ?? 0,
            targetDate: input.targetDate,
            userId: ctx.session.user.id,
        },
        });

        return goal;
    }),

    // Обновление цели
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

    // Удаление цели
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
});