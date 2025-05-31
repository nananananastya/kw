'use client';

import { AddEntityModal } from './baseAdd';
import { api } from '~/trpc/react';

interface CategoryProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string;
  type: 'INCOME' | 'EXPENSE';
}

export function AddCategoryModal({ isOpen, onClose, budgetId, type }: CategoryProps) {
  const utils = api.useUtils();

  const createCategory = api.category.addCategoryToBudget.useMutation({
    onSuccess: async () => {
      await utils.category.getCategoriesByBudgetAndType.invalidate();
      onClose();
    },
  });

  return (
    <AddEntityModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Добавить ${type === 'INCOME' ? 'доход' : 'расход'}`}
      fields={[
        { name: 'name', label: 'Название', type: 'text', placeholder: 'Например: Зарплата' },
        { 
          name: 'limit', 
          label: type === 'INCOME' ? 'Ожидание' : 'Лимит (₽)', 
          type: 'number', 
          placeholder: '00.00' 
        },
      ]}
      onSubmit={(values) => {
        const name = values.name!.trim();
        const limit = parseFloat(values.limit!);

        if (name && !isNaN(limit)) {
          createCategory.mutate({
            name,
            limit,
            budgetId,
            type,
          });
        }
      }}
    />
  );
}
