'use client';

import { AddEntityModal } from './baseAdd';
import { api } from '~/trpc/react';

interface CategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, limit: number, budgetId: string) => void;
  budgetId: string;
}

export function AddCategoryModal ({ isOpen, onClose, onAdd, budgetId }: CategoryProps) {
  const utils = api.useUtils(); 

  const createCategory = api.category.addCategoryToBudget.useMutation({
    onSuccess: async () => {
      await utils.category.getCategoriesWithExpenses.invalidate(budgetId);
      onClose(); 
    },
  });

  return (
    <AddEntityModal
      isOpen={isOpen}
      onClose={onClose}
      title="Добавить категорию"
      fields={[
        { name: 'name', label: 'Название', type: 'text', placeholder: 'Например: Развлечения' },
        { name: 'limit', label: 'Лимит (₽)', type: 'number', placeholder: '00.00' },
      ]}
      onSubmit={(values) => {
        const name = values.name!.trim();
        const limit = parseFloat(values.limit!);

        if (name && !isNaN(limit)) {
          createCategory.mutate({
            name,
            limit,
            budgetId,
          });
        }
      }}
    />
  );
};
