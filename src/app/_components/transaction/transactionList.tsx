'use client'

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import EditTransactionModal, { TransactionFormData } from './EditTransactionModal';
import { TransactionItem } from './item';
import { TransactionFilters } from './transactionFilters';
import Pagination from '~/app/ui/pagination';
import { toast } from 'react-hot-toast'; 
import React from 'react';

export function TransactionList() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const utils = api.useUtils();

  const page = Number(searchParams.get('page')) || 1;
  const size = Number(searchParams.get('size')) || 5;

  const [selectedTransaction, setSelectedTransaction] = useState<null | TransactionFormData>(null);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budgetFilter, setBudgetFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'INCOME' | 'EXPENSE' | ''>(''); // теперь локальный фильтр
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: budgets = [] } = api.budget.getUserBudgets.useQuery();
  const { data: categories = [] } = api.category.getCategoriesByBudget.useQuery(
    { budgetId: budgetFilter },
    { enabled: !!budgetFilter }  // Только если выбран бюджет
  );

  const { data, isLoading } = api.transaction.getUserTransactions.useQuery({
    page,
    size,
    startDate: startDate ?? undefined,
    endDate: endDate ?? undefined,
    budgetId: budgetFilter || undefined,
    categoryId: categoryFilter || undefined,
    sortBy,
    sortOrder,
  });

  const filteredTransactions = (data?.transactions ?? []).filter(t => {
    if (!typeFilter) return true;
    return t.category?.type === typeFilter;
  });

  const totalPages = Math.ceil((data?.total ?? 0) / size);  // math.ceil округление вверх

  const handleTransactionClick = (id: string | null) => {
    const transaction = filteredTransactions.find((t) => t.id === id);
    if (!transaction) return;

    setSelectedTransaction({
      id: transaction.id,
      date: new Date(transaction.date),
      description: transaction.description ?? '',
      category: transaction.category
        ? { id: transaction.category.id, name: transaction.category.name }
        : null,
      amount: transaction.amount,
      user: transaction.user
        ? { id: transaction.user.id, email: transaction.user.email ?? '' }
        : null,
      budget: transaction.budget
        ? { id: transaction.budget.id, name: transaction.budget.name }
        : null,
    });
  };

const updateTransaction = api.transaction.updateTransaction.useMutation({
  onSuccess: (result) => {
    if (result.success) {
      toast.success(result.message || 'Транзакция успешно обновлена');
      setSelectedTransaction(null); 
      utils.transaction.getUserTransactions.invalidate();
    } else {
      toast.error(result.message || 'Ошибка при обновлении транзакции');
    }
  },
  onError: (error) => {
    toast.error('Ошибка на уровне запроса: ' + error.message);
  },
});

  const handleTransactionSave = (updatedTransaction: typeof selectedTransaction) => {
    if (!updatedTransaction) return;

    const { id, description, category, amount, date } = updatedTransaction;

    updateTransaction.mutate({
      transactionId: id,
      description,
      categoryId: category?.id || '',
      amount,
      date,
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {  // загрузка при изменении фильтров
    utils.transaction.getUserTransactions.invalidate();
  }, [startDate, endDate, budgetFilter, categoryFilter, typeFilter, sortBy, sortOrder]);

  return (
    <div className="container mx-auto bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Транзакции</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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

        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-lg md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Список транзакций</h2>
          {isLoading ? (
            <p>Загрузка...</p>
          ) : (
            <>
              <ul className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => handleTransactionClick(transaction.id)}
                  />
                ))}
              </ul>
              <div className="mt-6 flex justify-center">
                <Pagination totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </>
          )}
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
