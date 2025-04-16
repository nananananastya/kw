import { auth } from "~/server/auth";
import { Header } from "../_components/header";
import { BudgetSelect } from "../_components/budget/budgetSelect";
import { db } from "~/server/db";

export default async function Home() {
  const session = await auth();

  if (!session?.user) return <div>Ты не авторизован</div>;

  // Получаем все бюджеты, в которых участвует пользователь
  const budgetUsers = await db.budgetUser.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      budget: true,
    },
  });

  // Преобразуем к формату, который ждёт компонент
  const userBudgets = budgetUsers.map(({ budget }) => ({
    id: budget.id,
    name: budget.name,
  }));

  return (
    <div>
      <Header title="Бюджет" />
      <BudgetSelect
        budgets={userBudgets}  // передаем данные как "budgets"
        selectedBudgetId={null}  // по умолчанию нет выбранного бюджета
      />
    </div>
  );
}
