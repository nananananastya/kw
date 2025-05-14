import React, { useState } from "react";
import { api } from "~/trpc/react";
import BalanceCard from "./balanceCard";
import { IncomeExpenseCard } from "./incomeExpenseCard";

export function BudgetSummaryCard ({ budgetId }: { budgetId: string }) {
  const [isFlippedBalance, setIsFlippedBalance] = useState(false);
  const [isFlippedIncome, setIsFlippedIncome] = useState(false);
  const summary = api.budget.getBudgetSummary.useQuery({ budgetId });

  if (summary.isLoading) return <div>Загрузка...</div>;
  if (summary.error) return <div>Ошибка: {summary.error.message}</div>;

  const { balance, income, expense } = summary.data!;

  return (
    <div className="container mx-auto grid grid-cols-2 gap-4 mb-4">
      <BalanceCard balance={balance} expense={expense} isFlipped={isFlippedBalance} setIsFlipped={setIsFlippedBalance} budgetId={budgetId} />
      <IncomeExpenseCard income={income} expense={expense} isFlipped={isFlippedIncome} setIsFlipped={setIsFlippedIncome} />
    </div>
  );
};
