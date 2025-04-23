// app/(app)/analytics/page.tsx
import { auth } from "~/server/auth";
import { Header } from "../_components/header";
import SummaryStatistics from "../_components/analytics/summaryStatistics";
import { api } from "~/trpc/server";
import AnalyticsChartContainer from "../_components/analytics/AnalyticsChartContainer";

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="text-center text-red-500 mt-10">Пользователь не найден</div>;
  }

  const summary = await api.analytics.getSummaryStatistics({ userId });

  return (
    <>
      <Header title="Финансовая аналитика" />
      <SummaryStatistics
        averageExpenses={summary.averageExpenses}
        largestExpenses={summary.largestExpenses}
        incomeExpenseRatio={summary.incomeExpenseRatio}
      />
      <AnalyticsChartContainer />
    </>
  );
}
