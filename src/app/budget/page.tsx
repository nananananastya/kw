import { auth } from "~/server/auth";
import { Header } from "../_components/header";
import BudgetSelect from "../_components/budget/budgetSelect";

export default async function Home() {
  const session = await auth();

  return (
    <>
      <Header
        title={session?.user?.email
          ? `Добро пожаловать ${session.user.email}!`
          : "Добро пожаловать!"}
      />
      <BudgetSelect />
    </>
  );
}
