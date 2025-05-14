'use client'

import { useState, useEffect } from 'react';
import { EditModalWrapper } from '../budget/baseEdit';
import { DateField } from '../dateField';
import { Input } from '../input';
import { Select } from '../select';
import { api } from '~/trpc/react';
import { toast } from 'react-hot-toast';
import React from 'react';

interface TransactionFormData {
  id: string;
  date: Date;
  description: string;
  category: { id: string; name: string } | null;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  user: { id: string; email: string } | null;
  budget: { id: string; name: string } | null;
};

export default function EditTransactionModal({ transaction, onClose, onSave } : {
  transaction: TransactionFormData;
  onClose: () => void;
  onSave: (updatedTransaction: TransactionFormData) => void;
}) {
  const [formData, setFormData] = useState<TransactionFormData>(transaction);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(transaction.category?.id ?? null);

  const utils = api.useUtils();
  const deleteMutation = api.transaction.deleteTransaction.useMutation({
    onSuccess: () => {
      utils.invalidate();
      onClose();
    },
    onError: (error) => {
      alert("Ошибка при удалении транзакции: " + error.message);
    },
  });

const { data: categories } = api.category.getCategoriesByBudget.useQuery({
  budgetId: transaction.budget?.id || '',
});

  useEffect(() => {
    setFormData(transaction);
    setSelectedCategoryId(transaction.category?.id ?? null);
  }, [transaction]);

  const handleChange = (
    field: keyof TransactionFormData,
    value: string | number | Date | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value as never,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const date = formData.date instanceof Date && !isNaN(formData.date.getTime())
      ? formData.date
      : new Date(); 
  
    const updated = {
      ...formData,
      date,
      category: categories?.find((c) => c.id === selectedCategoryId) ?? null,
    };
  
    try {
      await onSave(updated);
    } catch (error) {

      if (error instanceof Error) {
        if (error.message === "У вас нет прав на изменение этой транзакции") {
          toast.error(error.message);
        } else {
          toast.error('Неизвестная ошибка при обновлении транзакции');
        }
      }
    }
  }; 

  const handleDelete = async () => {

    const { success, message } = await deleteMutation.mutateAsync({ transactionId: transaction.id });
  
    if (!success) {
      toast.error(message || "У вас нет прав на удаление этой транзакции");
      return; 
    }
  
    if (confirm("Вы уверены, что хотите удалить эту транзакцию?")) {
      deleteMutation.mutate(
        { transactionId: transaction.id },
        {
          onSuccess: (data) => {
            if (data.success) {
              toast.success("Транзакция успешно удалена");
              utils.invalidate(); 
              onClose(); 
            } else {
              toast.error(data.message || "Не удалось удалить транзакцию");
            }
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? `Ошибка при удалении транзакции: ${error.message}`
                : "Неизвестная ошибка"
            );
          },
        }
      );
    }
  };
  
  return (
    <EditModalWrapper
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Редактировать"
      onDelete={handleDelete}
    >
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Пользователь</label>
          <input
            type="text"
            value={formData.user?.email || 'Не указан'}
            readOnly
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Бюджет</label>
          <input
            type="text"
            value={formData.budget?.name || 'Не указан'}
            readOnly
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Описание</label>
          <Input
            type="text"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Описание"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Категория</label>
          <Select
            id="category-select"
            value={selectedCategoryId ?? ''}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            options={
              categories?.map((c) => ({ label: c.name, value: c.id })) ?? []
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Сумма</label>
          <Input
            type="number"
            value={formData.amount === 0 ? '' : formData.amount.toString()}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
            placeholder="Сумма"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Тип операции</label>
          <Select
            value={formData.type}
            onChange={(e) =>
              handleChange('type', e.target.value as 'INCOME' | 'EXPENSE')
            }
            options={[
              { label: 'Доход', value: 'INCOME' },
              { label: 'Расход', value: 'EXPENSE' },
            ]}
            id="transaction-type"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Дата</label>
          <DateField
            value={formData.date}
            onChange={(date: Date | null) => {
              if (date && !isNaN(date.getTime())) {
                handleChange('date', date);
              } else {
                handleChange('date', new Date()); 
              }
            }}
            className="w-full border p-2 rounded"
            maxDate={new Date()}
          />
        </div>
      </div>
    </EditModalWrapper>
  );
}
