'use client'

import { useState, useEffect } from 'react';
import { EditModalWrapper } from '../budget/baseEdit';
import { DateField } from '../dateField';
import { Input } from '../input';
import { Select } from '../select';
import { api } from '~/trpc/react';

type TransactionFormData = {
  id: string;
  date: Date;
  description: string;
  category: { id: string; name: string } | null;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  user: { id: string; email: string } | null;  // Пользователь, создавший транзакцию
  budget: { id: string; name: string } | null;  // Бюджет, связанный с транзакцией
};

export default function EditTransactionModal({
  transaction,
  onClose,
  onSave,
}: {
  transaction: TransactionFormData;
  onClose: () => void;
  onSave: (updatedTransaction: TransactionFormData) => void;
}) {
  const [formData, setFormData] = useState(transaction);

  useEffect(() => {
    setFormData(transaction);
  }, [transaction]);

  const handleChange = (
    field: keyof TransactionFormData,
    value: string | number | Date | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

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

  const handleDelete = () => {
    if (confirm("Вы уверены, что хотите удалить эту транзакцию?")) {
      deleteMutation.mutate({ transactionId: transaction.id });
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
              placeholder="Пользователь"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Бюджет</label>
              <input
                type="text"
                value={formData.budget?.name || 'Не указан'}
                readOnly
                placeholder="Бюджет"
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
              <Input
                type="text"
                value={formData.category?.name ?? ""}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="Категория"
              />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Сумма</label>
              <Input
                type="number"
                value={formData.amount}
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
                onChange={(date: Date | null) => handleChange('date', date)}
                className="w-full border p-2 rounded"
              />
          </div>
      </div>
    </EditModalWrapper>
  );
}
