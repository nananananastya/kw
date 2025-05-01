import { PrismaClient } from "@prisma/client";

export const requireBudgetOwner = async ({
  db,
  userId,
  budgetId,
}: {
  db: PrismaClient;
  userId: string;
  budgetId: string;
}) => {
  const roleEntry = await db.budgetUser.findFirst({
    where: {
      budgetId,
      userId,
    },
  });

  if (!roleEntry || roleEntry.role !== "OWNER") {
    throw new Error("Эта функция доступна только владельцу бюджета!");
  }
};
