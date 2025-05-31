'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AnalyticsChart from './analyticsChart';
import IncomeExpenseChart from './incomeExpenseChart';
import { api } from '~/trpc/react';
import { Select } from "../select";
import { DateField } from "../dateField";

export default function AnalyticsChartContainer() {
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');   //  выбранныйй бюджет 
  const [period, setPeriod] = useState<'allTime' | 'lastMonth' | 'custom'>('allTime'); // выбранный период
  // для пользовательского периода 
  const [startDate, setStartDate] = useState<string | undefined>(''); 
  const [endDate, setEndDate] = useState<string | undefined>(''); 

  const { data: budgets = [], isLoading: loadingBudgets } = api.budget.getUserBudgets.useQuery(); // бюджеты к которым есть доступ у пользователя

  // для круговой и столбчатой диаграммы
  const { data: chartData = [], isLoading: loadingChart } = api.analytics.getCategoryAnalyticsByBudget.useQuery(
    { 
      budgetId: selectedBudgetId,
      period,
      startDate,
      endDate,
    },
  );

  const expenseData = chartData.filter(item => item.type === 'EXPENSE');
const incomeData = chartData.filter(item => item.type === 'INCOME');

// для линейного графика
  const { data: incomeExpenseData = [], isLoading: loadingIncomeExpense } = api.analytics.getIncomeExpenseByBudget.useQuery(
    {
      budgetId: selectedBudgetId,
      period,
      startDate,
      endDate,
    },
  );

  // для выбора первого бюджета
  useEffect(() => {
    if (!selectedBudgetId && budgets && budgets.length > 0) {
      const firstBudget = budgets[0];
      if (firstBudget?.id) {
        setSelectedBudgetId(firstBudget.id);
      }
    }
  }, [budgets, selectedBudgetId]);
  

// обработчик соьытий при изменении периода 
  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPeriod = event.target.value as 'allTime' | 'lastMonth' | 'custom';
    setPeriod(selectedPeriod);

    if (selectedPeriod !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

// преобразование данных в строку
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date ? date.toISOString().split('T')[0] : '');
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date ? date.toISOString().split('T')[0] : '');
  };

return (
  <div className="container mx-auto py-6">
    {/* панель фильтров */}
    <div className="mb-6">
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* выбор бюджета и периода */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="w-60">
            <label htmlFor="budget" className="text-white text-l mb-2 block">Выберите бюджет</label>
            <Select
              value={selectedBudgetId}
              onChange={(e) => setSelectedBudgetId(e.target.value)}
              options={budgets.map((b) => ({ label: b.name, value: b.id }))}
              disabled={loadingBudgets}
              id="budget"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="period" className="text-white text-l mb-2 block">Период</label>
            <select
              value={period}
              onChange={handlePeriodChange}
              id="period"
              className="mt-1 block w-full rounded-md border-2 p-3 transition-all duration-300 ease-in-out"
            >
              <option value="allTime">Все время</option>
              <option value="lastMonth">Последний месяц</option>
              <option value="custom">Пользовательский</option>
            </select>
          </div>
        </div>

        {/* кастомные даты */}
        {period === 'custom' && (
          <div className="mt-4 flex gap-4 flex-wrap">
            <div className="min-w-[200px]">
              <label htmlFor="startDate" className="text-white text-l mb-2 block">Дата начала</label>
              <DateField
                value={startDate ? new Date(startDate) : null}
                onChange={handleStartDateChange}
                className="border border-transparent focus:ring-2 rounded-lg px-4 py-2 w-full transition duration-300"
              />
            </div>
            <div className="min-w-[200px]">
              <label htmlFor="endDate" className="text-white text-l mb-2 block">Дата окончания</label>
              <DateField
                value={endDate ? new Date(endDate) : null}
                onChange={handleEndDateChange}
                className="border border-transparent focus:ring-2 rounded-lg px-4 py-2 w-full transition duration-300"
              />
            </div>
          </div>
        )}
      </div>
    </div>

    {selectedBudgetId ? (
      <>
        {/* Категории - увеличить фон и отступы */}
        <div className="-mx-4 px-4 sm:-mx-8 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-md p-8 min-h-[450px]">
            <AnalyticsChart categoryData={expenseData} title="Распределение расходов по категориям" />
          </div>
          <div className="bg-white rounded-2xl shadow-md p-8">
            <AnalyticsChart categoryData={incomeData} title="Распределение доходов по категориям" />
          </div>
        </div>

        {/* Линейный график - на всю ширину */}
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-md p-8 w-full">
            <IncomeExpenseChart data={incomeExpenseData} />
          </div>
        </div>
      </>
    ) : (
      <div className="bg-white rounded-2xl shadow-md p-6 w-full h-full">
        <p className="text-gray-500">Выберите бюджет для отображения данных.</p>
      </div>
    )}
  </div>
)
}