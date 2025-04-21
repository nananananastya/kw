'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { Category, TransactionType } from '@prisma/client';
import EditTransactionModal from './EditTransactionModal';
import { TransactionItem } from './item';
import { TransactionFilters } from './transactionFilters';
import { Select } from '../select';

export default function TransactionList() {
  const [selectedTransaction, setSelectedTransaction] = useState<null | any>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budgetFilter, setBudgetFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: budgets = [] } = api.budget.getUserBudgets.useQuery();
  const { data: transactionsRaw = [], refetch } = api.transaction.getUserTransactions.useQuery();
  const { data: categories = [] } = api.transaction.getCategoriesByBudget.useQuery(
    { budgetId: budgetFilter },
    { enabled: !!budgetFilter }
  );

  const transactions = transactionsRaw
    .filter((t) => {
      const isWithinDateRange =
        (!startDate || new Date(t.date) >= startDate) &&
        (!endDate || new Date(t.date) <= endDate);
      const isMatchingBudget = budgetFilter ? t.budget?.id === budgetFilter : true;
      const isMatchingCategory = categoryFilter ? t.category?.id === categoryFilter : true;
      const isMatchingType = typeFilter ? t.type === typeFilter : true;

      return isWithinDateRange && isMatchingBudget && isMatchingCategory && isMatchingType;
    })
    .sort((a, b) => {
      const direction = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'amount') {
        return (a.amount - b.amount) * direction;
      }
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction;
    });

  const handleTransactionClick = (id: string | null) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    setSelectedTransaction({
      id: transaction.id,
      date: new Date(transaction.date),
      description: transaction.description,
      category: transaction.category
        ? { id: transaction.category.id, name: transaction.category.name }
        : null,
      amount: transaction.amount,
      type: transaction.type,
      user: transaction.user
        ? { id: transaction.user.id, email: transaction.user.email ?? '' }
        : null,
      budget: transaction.budget
        ? { id: transaction.budget.id, name: transaction.budget.name }
        : null,
    });
  };

  const { mutateAsync: updateTransaction } = api.transaction.updateTransaction.useMutation();

  const handleTransactionSave = async (updatedTransaction: typeof selectedTransaction) => {
    if (!updatedTransaction) return;

    try {
      const { id, description, category, amount, type } = updatedTransaction;
      await updateTransaction({
        transactionId: id,
        description,
        categoryId: category?.id || '',
        amount,
        type,
      });
      setSelectedTransaction(null);
      await refetch();
    } catch (error: any) {
      console.error('Ошибка при обновлении транзакции:', error);
    }
  };

  return (
    <div className="container mx-auto bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Транзакции</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Фильтры */}
        <div className="bg-white p-6 rounded-xl shadow-md">

        <TransactionFilters
           startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          categories={categories}
          budgets={budgets}
          budgetFilter={budgetFilter}
          setBudgetFilter={setBudgetFilter}
        />

        </div>

        {/* Список транзакций */}
        <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Список транзакций</h2>
          <ul className="space-y-4">
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onClick={() => handleTransactionClick(transaction.id)}
              />
            ))}
          </ul>
        </div>
      </div>

      {selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onSave={handleTransactionSave}
        />
      )}
    </div>
  );
}
