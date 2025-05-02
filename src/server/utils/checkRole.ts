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

export const canEditOrDeleteTransaction = async ({
  db,
  userId,
  transactionId,
  actionType, 
}: {
  db: PrismaClient;
  userId: string;
  transactionId: string;
  actionType: 'delete' | 'update';
}) => {
  const transaction = await db.transaction.findUnique({
    where: { id: transactionId },
    include: { budget: true },
  });

  if (!transaction) throw new Error("Транзакция не найдена");

  const role = await db.budgetUser.findFirst({
    where: {
      budgetId: transaction.budgetId,
      userId,
    },
  });

  if (!role) throw new Error("Вы не являетесь участником бюджета");

  const isOwner = role.role === 'OWNER';
  const isAuthor = transaction.userId === userId;

  // Генерация сообщений в зависимости от типа действия
  const permissionDeniedMessage = actionType === 'delete'
    ? "У вас нет прав на удаление этой транзакции"
    : "У вас нет прав на изменение этой транзакции";

  // Проверяем права
  if (!isOwner && !isAuthor) {
    return { success: false, message: permissionDeniedMessage };
  }

  return { success: true, transaction };
};
