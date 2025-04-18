import { auth } from "~/server/auth";
import { Header } from "../_components/header";
import BudgetSelect from "../_components/budget/budgetSelect";


export default async function BudgetPage() {
  const session = await auth();

  return (
    <>
      <Header
        title={"Бюджет"}
      />
      <BudgetSelect />
    </>
  );
}
