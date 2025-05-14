'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AnalyticsChart from './analyticsChart';
import IncomeExpenseChart from './incomeExpenseChart';
import { api } from '~/trpc/react';
import { Select } from "../select";
import { DateField } from "../dateField";

export default function AnalyticsChartContainer() {
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [period, setPeriod] = useState<'allTime' | 'lastMonth' | 'custom'>('allTime');
  const [startDate, setStartDate] = useState<string | undefined>(''); 
  const [endDate, setEndDate] = useState<string | undefined>(''); 

  const { data: budgets = [], isLoading: loadingBudgets } = api.budget.getUserBudgets.useQuery();

  const { data: chartData = [], isLoading: loadingChart } = api.analytics.getCategoryAnalyticsByBudget.useQuery(
    { 
      budgetId: selectedBudgetId,
      period,
      startDate,
      endDate,
    },
    { enabled: !!selectedBudgetId }
  );

  const { data: incomeExpenseData = [], isLoading: loadingIncomeExpense } = api.analytics.getIncomeExpenseByBudget.useQuery(
    {
      budgetId: selectedBudgetId,
      period,
      startDate,
      endDate,
    },
    { enabled: !!selectedBudgetId }
  );

  useEffect(() => {
    if (!selectedBudgetId && budgets && budgets.length > 0) {
      const firstBudget = budgets[0];
      if (firstBudget?.id) {
        setSelectedBudgetId(firstBudget.id);
      }
    }
  }, [budgets, selectedBudgetId]);
  

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPeriod = event.target.value as 'allTime' | 'lastMonth' | 'custom';
    setPeriod(selectedPeriod);

    if (selectedPeriod !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date ? date.toISOString().split('T')[0] : '');
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date ? date.toISOString().split('T')[0] : '');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-60 mr-2">
              <label htmlFor="budget" className="text-white text-l mb-2 block">Выберите бюджет</label>
              <Select
                value={selectedBudgetId}
                onChange={(e) => setSelectedBudgetId(e.target.value)}
                options={budgets.map((b) => ({ label: b.name, value: b.id }))}
                disabled={loadingBudgets}
                id="budget"
              />
            </div>

            <div className="w-full mr-2">
              <label htmlFor="period" className="text-white text-l mb-2 block">Период</label>
              <select
                value={period}
                onChange={handlePeriodChange}
                id="period"
                className={`mt-1 block w-full rounded-md border-2 p-3 transition-all duration-300 ease-in-out`}
              >
                <option value="allTime">Все время</option>
                <option value="lastMonth">Последний месяц</option>
                <option value="custom">Пользовательский</option>
              </select>
            </div>
          </div>

          {period === 'custom' && (
            <div className="mb-4 flex gap-4 justify-start">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-md p-6 w-full">
              <AnalyticsChart categoryData={chartData} />
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 w-full">
              <IncomeExpenseChart data={incomeExpenseData} />
            </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-6 w-full h-full">
          <p className="text-gray-500">Выберите бюджет для отображения данных.</p>
        </div>
      )}
    </div>
  );
};