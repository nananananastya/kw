import React from 'react';

interface SummaryStatisticsProps {
  averageExpenses: number;
  largestExpenses: number;
  incomeExpenseRatio: number;
}

export default function SummaryStatistics ({ averageExpenses, largestExpenses, incomeExpenseRatio }: SummaryStatisticsProps) {
  if (averageExpenses === undefined || largestExpenses === undefined || incomeExpenseRatio === undefined) {
    return <div className="text-gray-500 italic">Нет сводной статистики для отображения.</div>;
  }

  const formattedAverageExpenses = averageExpenses.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  });
  const formattedLargestExpenses = largestExpenses.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  });
  const formattedIncomeExpenseRatio = (incomeExpenseRatio * 100).toFixed(2) + '%'; 

  return (
    <div className="container mx-auto b bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-xl shadow-xl flex flex-col justify-center items-center transition-transform transform hover:scale-105 ease-in-out">
      <h2 className="text-2xl font-bold text-white mb-4">Сводная статистика</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="flex flex-col items-center justify-center rounded-lg p-4">
          <div className="text-white font-medium mb-2">Средние расходы</div>
          <div className="text-3xl font-bold text-white">{formattedAverageExpenses}</div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg p-4">
          <div className="text-white font-medium mb-2">Крупнейшие траты</div>
          <div className="text-3xl font-bold text-white">{formattedLargestExpenses}</div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg p-4">
          <div className="text-white font-medium mb-2">Доходы/Расходы</div>
          <div className="text-3xl font-bold text-white">{formattedIncomeExpenseRatio}</div>
        </div>
      </div>
    </div>
  );
};