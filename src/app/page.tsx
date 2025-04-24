import { auth } from "~/server/auth";
import { Header } from "./_components/header";
import  QuickActionsHero from "./_components/home/quickActionsHero";
import FinancialGoalsList from "./_components/budget/goalList";
import DashboardSummary from "./_components/home/dashboardSummary";


export default async function Home() {

  const session = await auth();

  return (
    <>
      <Header title={session?.user?.email ? `Добро пожаловать ${session.user.email}!` : "Добро пожаловать!"}></Header>
      <DashboardSummary />
      <QuickActionsHero />
      <FinancialGoalsList />
    </>
  );
}
