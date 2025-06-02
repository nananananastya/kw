'use client';

import { useState, useEffect } from 'react';
import { EditModalWrapper } from '../budget/baseEdit';
import { DateField } from '../dateField';
import { Input } from '../input';
import { Select } from '../select';
import { api } from '~/trpc/react';
import { toast } from 'react-hot-toast';
import React from 'react';

export interface TransactionFormData {
  id: string;
  date: Date;
  description: string;
  category: { id: string; name: string } | null;
  amount: number;
  user: { id: string; email: string } | null;
  budget: { id: string; name: string } | null;
}

export default function EditTransactionModal({
  transaction,
  onClose,
  onSave,
}: {
  transaction: TransactionFormData;
  onClose: () => void;
  onSave: (updatedTransaction: TransactionFormData) => void;
}) {
  const [formData, setFormData] = useState<TransactionFormData>(transaction);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    transaction.category?.id ?? null
  );

  const utils = api.useUtils();
  const deleteMutation = api.transaction.deleteTransaction.useMutation({
    onSuccess: () => {
      utils.invalidate();
      onClose();
    },
    onError: (error) => {
      alert('Ошибка при удалении транзакции: ' + error.message);
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

    const updated = {
      ...formData,
      category: categories?.find((c) => c.id === selectedCategoryId) ?? null,
      date: formData.date,
    };

    try {
      await onSave(updated);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Неизвестная ошибка при обновлении транзакции');
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту транзакцию?')) return;

    try {
      const data = await deleteMutation.mutateAsync({ transactionId: transaction.id });

      if (data.success) {
        toast.success('Транзакция успешно удалена');
        utils.invalidate();
        onClose();
      } else {
        toast.error(data.message || 'Не удалось удалить');
      }
    } catch (error) {
      toast.error('Ошибка при удалении транзакции');
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
          <label>Пользователь</label>
          <Input type="text" value={formData.user?.email || 'Не указан'} readOnly />
        </div>

        <div>
          <label>Бюджет</label>
          <Input type="text" value={formData.budget?.name || 'Не указан'} readOnly />
        </div>

        <div>
          <label>Описание</label>
          <Input
            type="text"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        <div>
          <label>Категория</label>
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
          <label>Сумма</label>
          <Input
            type="number"
            value={formData.amount === 0 ? '' : formData.amount.toString()}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
          />
        </div>

        <div>
          <label>Дата</label>
          <DateField
            value={formData.date}
            onChange={(date: Date | null) =>
              handleChange('date', date ?? new Date())
            }
            maxDate={new Date()}
            className="w-full border p-2 rounded"
            onKeyDown={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </EditModalWrapper>
  );
}
