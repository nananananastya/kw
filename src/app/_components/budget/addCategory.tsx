'use client';

import { AddEntityModal } from './baseAdd';
import { api } from '~/trpc/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, limit: number, budgetId: string) => void;
  budgetId: string;
}

export const AddCategoryModal = ({ isOpen, onClose, onAdd, budgetId }: Props) => {
  const utils = api.useUtils(); // утилиты TRPC

  const createCategory = api.budget.addCategoryToBudget.useMutation({
    onSuccess: async () => {
      // 👇 Инвалидируем именно getCategoriesWithExpenses
      await utils.budget.getCategoriesWithExpenses.invalidate(budgetId);
      onClose(); // закрываем модалку
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
