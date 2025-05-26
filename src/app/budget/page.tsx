import { Header } from "../_components/header";
import BudgetSelect from "../_components/budget/budgetSelect";


export default async function BudgetPage() {

  return (
    <>
      <Header title={"Бюджет"} />
      <BudgetSelect />
    </>
  );
}
