'use client';

import { useState } from "react";
import { api } from '~/trpc/react';
import { Input } from "../input";
import { Select } from "../select";
import { DateField } from "../dateField";
import { TransactionType } from "@prisma/client";
import { Button } from "../button";
import { toast } from 'react-hot-toast';

const transactionTypeLabels: Record<TransactionType, string> = {
  INCOME: "Доход",
  EXPENSE: "Расход",
};

export const AddTransactionForm = () => {
  const utils = api.useUtils(); 

  const createTransaction = api.transaction.createTransaction.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message); 
        resetForm();
        utils.transaction.getUserTransactions.invalidate();
      } else {
        toast.error(data.message); 
      }
    },
    onError: (error) => {
      toast.error(`Ошибка при добавлении: ${error.message}`);
    }
  });
  
  

  const { data: budgets = [], isLoading: loadingBudgets } = api.budget.getUserBudgets.useQuery();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");

  const { data: categories = [], isLoading: loadingCategories } = api.budget.getCategoriesForBudget.useQuery(
    selectedBudgetId,
    {
      enabled: !!selectedBudgetId,
    }
  );

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TransactionType | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date | null>(null); 

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setType("");
    setCategoryId("");
    setSelectedBudgetId("");
    setDate(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !type || !categoryId || !selectedBudgetId || !date) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    createTransaction.mutate({
      amount: parseFloat(amount),
      description,
      type: type as TransactionType,
      categoryId,
      budgetId: selectedBudgetId,
      date: date.toISOString(), 
    });
  };

  return (
    <div className="container mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Новая финансовая запись</h2>
      <form className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" onSubmit={handleSubmit}>
      <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">К какому бюджету относится?</label>
          {loadingBudgets ? (
            <div>Загрузка бюджета...</div>
          ) : (
            <Select
              value={selectedBudgetId}
              onChange={(e) => setSelectedBudgetId(e.target.value)}
              options={budgets.map((b) => ({
                label: b.name,
                value: b.id,
              }))}
              id="budget"
              disabled={loadingBudgets}
            />
          )}
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Выберите категорию</label>
          {loadingCategories ? (
            <div>Загрузка категорий...</div>
          ) : (
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
              id="category"
              disabled={!selectedBudgetId}
            />
          )}
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">Тип операции</label>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            options={Object.values(TransactionType).map((value) => ({
              label: transactionTypeLabels[value],
              value,
            }))}
            id="type"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Краткое описание</label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например, кофе на завтрак"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Сколько потрачено/заработано?</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="₽0.00"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Когда это было?</label>
          <DateField
            value={date}
            onChange={(d) => {
              if (d instanceof Date && !isNaN(d.getTime())) {
                setDate(d); 
              } else {
                setDate(null);
              }
            }}
            className="block h-12 rounded-md border-2 border-gray-300 p-3"
            maxDate={new Date()}
          />

        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-start mt-4 gap-4">
          <Button type="submit">Добавить</Button>
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-14 rounded focus:outline-none focus:shadow-outline transition-colors"
            onClick={resetForm}
          >
            Очистить
          </button>
        </div>
      </form>
    </div>
  );
};
