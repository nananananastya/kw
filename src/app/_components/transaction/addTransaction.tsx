'use client';

import { useState } from "react";
import { api } from '~/trpc/react';
import { Input } from "../input";
import { Select } from "../select";
import { DateField } from "../dateField";
import { Button } from "../button";
import { toast } from 'react-hot-toast';
import { CategoryType } from "@prisma/client";

export function AddTransactionForm() {
  const utils = api.useUtils();

  const createTransaction = api.transaction.createTransaction.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        resetForm();
        // utils.transaction.getUserTransactions.invalidate();
        utils.budget.getBudgetSummary.invalidate()
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
  const [selectedType, setSelectedType] = useState<"INCOME" | "EXPENSE" | "">("");

  const { data: categories = [], isLoading: loadingCategories } = api.category.getCategoriesByBudget.useQuery(
    { budgetId: selectedBudgetId },
    { enabled: !!selectedBudgetId }
  );

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategoryId("");
    setSelectedBudgetId("");
    setSelectedType("");
    setDate(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !categoryId || !selectedBudgetId || !date) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    createTransaction.mutate({
      amount: parseFloat(amount),
      description,
      categoryId,
      budgetId: selectedBudgetId,
      date: date.toISOString(),
    });
  };

  // Фильтрация категорий по типу
  const filteredCategories = categories?.filter((c) => c.type === selectedType) ?? [];

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
              onChange={(e) => {
                setSelectedBudgetId(e.target.value);
                setCategoryId("");
              }}
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
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">Тип операции</label>
          <Select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value as "INCOME" | "EXPENSE");
              setCategoryId("");
            }}
            options={[
              { label: "Доход", value: "INCOME" },
              { label: "Расход", value: "EXPENSE" },
            ]}
            id="type"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
          {loadingCategories ? (
            <div>Загрузка категорий...</div>
          ) : (
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={filteredCategories.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
              id="category"
              disabled={!selectedBudgetId || !selectedType}
            />
          )}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">Тип операции</label>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
            options={[
              { label: 'Все типы', value: '' },
              ...['INCOME', 'EXPENSE'].map((type) => ({
                label: type === 'INCOME' ? 'Доход' : 'Расход',
                value: type,
              })),
            ]}
            id="type"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Краткое описание</label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например, продажа курсов"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Сумма</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="₽0.00"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
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
            onKeyDown={(e) => e.preventDefault()}
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
}
