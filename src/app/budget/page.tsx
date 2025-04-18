import { auth } from "~/server/auth";
import { Header } from "../_components/header";
import BudgetSelect from "../_components/budget/budgetSelect";
import FinancialGoalsList from "../_components/budget/goalList";

export default async function BudgetPage() {

  return (
    <>
      <Header title={"Бюджет"} />
      <BudgetSelect />
      <FinancialGoalsList />
      
    </>
  );
}
