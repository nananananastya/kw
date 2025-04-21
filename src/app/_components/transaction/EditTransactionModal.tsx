'use client'

import { useState, useEffect } from 'react';
import { EditModalWrapper } from '../budget/baseEdit';
import { DateField } from '../dateField';
import { Input } from '../input';
import { Select } from '../select';

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

  return (
    <EditModalWrapper
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Редактировать транзакцию"
    >
      <div className="space-y-4">
        <DateField
          value={formData.date}
          onChange={(date: Date | null) => handleChange('date', date)}
          className="w-full border p-2 rounded"
        />

        <Input
          type="text"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Описание"
        />

        <Input
          type="text"
          value={formData.category?.name ?? ""}
          onChange={(e) => handleChange('category', e.target.value)}
          placeholder="Категория"
        />

        <Input
          type="number"
          value={formData.amount}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
          placeholder="Сумма"
        />

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

        {/* Поле для отображения пользователя, создавшего транзакцию */}
        <input
          type="text"
          value={formData.user?.email || 'Не указан'}
          readOnly
          placeholder="Пользователь"
        />

        {/* Поле для отображения бюджета, связанного с транзакцией */}
        <input
          type="text"
          value={formData.budget?.name || 'Не указан'}
          readOnly
          placeholder="Бюджет"
        />
      </div>
    </EditModalWrapper>
  );
}
