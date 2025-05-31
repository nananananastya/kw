import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionFilters } from '../src/app/_components/transaction/transactionFilters';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import React from 'react';

describe('TransactionFilters', () => {
  const mockSetStartDate = vi.fn();
  const mockSetEndDate = vi.fn();
  const mockSetCategoryFilter = vi.fn();
  const mockSetTypeFilter = vi.fn();
  const mockSetSortBy = vi.fn();
  const mockSetSortOrder = vi.fn();
  const mockSetBudgetFilter = vi.fn();

  const mockCategories: { id: string; name: string; budgetId: string; limit: number }[] = [
    {
      id: 'cat1',
      name: 'Продукты',
      budgetId: 'b1',
      limit: 1000,
    },
    {
      id: 'cat2',
      name: 'Развлечения',
      budgetId: 'b2',
      limit: 500,
    },
  ];
  

const mockBudgets = [
  { id: 'b1', name: 'Основной бюджет', amount: 10000 },
  { id: 'b2', name: 'Путешествия', amount: 50000 },
];

  beforeEach(() => {
    render(
      <TransactionFilters
        startDate={null}
        setStartDate={mockSetStartDate}
        endDate={null}
        setEndDate={mockSetEndDate}
        categoryFilter=""
        setCategoryFilter={mockSetCategoryFilter}
        typeFilter=""
        setTypeFilter={mockSetTypeFilter}
        sortBy="amount"
        setSortBy={mockSetSortBy}
        sortOrder="asc"
        setSortOrder={mockSetSortOrder}
        categories={mockCategories}
        budgets={mockBudgets}
        budgetFilter=""
        setBudgetFilter={mockSetBudgetFilter}
      />
    );
  });
  it('отображает все заголовки фильтров', () => {
    expect(screen.getByText(/Дата начала/i)).toBeInTheDocument();
    expect(screen.getByText(/Дата окончания/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Бюджет/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Категория/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Тип транзакции/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Сортировать по/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Порядок сортировки/i })).toBeInTheDocument();
  });
  

  it('запускает кнопку очистки фильтров', () => {
    const clearButton = screen.getByRole('button', { name: /Очистить/i });
    fireEvent.click(clearButton);

    expect(mockSetStartDate).toHaveBeenCalledWith(null);
    expect(mockSetEndDate).toHaveBeenCalledWith(null);
    expect(mockSetBudgetFilter).toHaveBeenCalledWith('');
    expect(mockSetCategoryFilter).toHaveBeenCalledWith('');
    expect(mockSetTypeFilter).toHaveBeenCalledWith('');
    expect(mockSetSortBy).toHaveBeenCalledWith('date');
    expect(mockSetSortOrder).toHaveBeenCalledWith('desc');
  });

  it('рендеринг выпадающего списка бюджета', () => {
    const budgetSelect = screen.getByLabelText(/Бюджет/i);
    expect(budgetSelect).toBeInTheDocument();
  });

  it('рендеринг выпадающего списка категорий по бюджету', () => {
    const categorySelect = screen.getByLabelText(/Категория/i);
    expect(categorySelect).toBeInTheDocument();
  });
});
