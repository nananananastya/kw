import { Select } from '../select';
import { DateField } from '../dateField';
import { Category, CategoryType, Budget } from '@prisma/client';
import React from 'react';

interface TransactionFiltersProps {
    startDate: Date | null;
    setStartDate: (date: Date | null) => void;
    endDate: Date | null;
    setEndDate: (date: Date | null) => void;
    categoryFilter: string;
    setCategoryFilter: (category: string) => void;
    typeFilter: CategoryType | '';
    setTypeFilter: (type: CategoryType | '') => void;
    sortBy: 'amount' | 'date';
    setSortBy: (value: 'amount' | 'date') => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (value: 'asc' | 'desc') => void;
    categories: Category[];
    budgets: Budget[]; 
    budgetFilter: string;
    setBudgetFilter: (budget: string) => void;
  }
  
  export const TransactionFilters = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    categories,
    budgets,
    budgetFilter,
    setBudgetFilter,
  }: TransactionFiltersProps) => {
    const sortByOptions = ['date', 'amount'];
    const sortOrderOptions = ['asc', 'desc'];
  
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 w-full max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Фильтры транзакций</h2>
  
        <div className="space-y-2">

          <div className="flex gap-6">
            <div className="flex flex-col w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
              <DateField
                value={startDate}
                onChange={(date) => setStartDate(date)}
                className="block w-full p-3 rounded-md border border-gray-300"
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
            <div className="flex-col w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
              <DateField
                value={endDate}
                onChange={(date) => setEndDate(date)}
                className="block w-full p-3 rounded-md border border-gray-300"
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="budget-filter">Бюджет</label>
            <Select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              options={[{ label: 'Все бюджеты', value: '' }, ...budgets.map(b => ({ label: b.name, value: b.id }))]}
              id="budget-filter"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category-filter">Категория</label>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[{ label: 'Все категории', value: '' }, ...categories.map(c => ({ label: c.name, value: c.id }))]}
              id="category-filter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type-filter">Тип транзакции</label>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CategoryType | '')}
              options={[
                { label: 'Все типы', value: '' },
                ...['INCOME', 'EXPENSE'].map((type) => ({
                  label: type === 'INCOME' ? 'Доход' : 'Расход',
                  value: type,
                })),
              ]}
              id="type-filter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sort-by-filter">Сортировать по</label>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'amount' | 'date')}
              options={sortByOptions.map(option => ({ label: option === 'amount' ? 'Сумма' : 'Дата', value: option }))}
              id="sort-by-filter"
            />
          </div>
  
          <div >
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sort-order-filter">Порядок сортировки</label>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              options={sortOrderOptions.map(option => ({ label: option === 'asc' ? 'По возрастанию' : 'По убыванию', value: option }))}
              id="sort-order-filter"
            />
          </div>
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setBudgetFilter('');
                setCategoryFilter('');
                setTypeFilter('');
                setSortBy('date');
                setSortOrder('desc');
              }}
              className="bg-gray-300 text-sm text-gray-700 border border-gray-300 font-medium hover:bg-gray-400 px-4 py-2 rounded transition-all"
            >
              Очистить
            </button>
          </div>
        </div>
      </div>
    );
  };
  