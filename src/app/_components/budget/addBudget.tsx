'use client';

import { AddEntityModal } from './baseAdd';
import { api } from '~/trpc/react';
import React from 'react'; 

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGroup: (groupId: string, groupName: string) => void;
}

export function AddBudgetModal ({ isOpen, onClose }: AddBudgetModalProps) {
  const utils = api.useUtils();
  const createBudget = api.budget.create.useMutation({
    onSuccess: async () => {
      await utils.budget.getUserBudgets.invalidate(); // инвалидация trpc из-за того что данные устарели 
      onClose();
    },
  });

  return (
    <AddEntityModal
      isOpen={isOpen}
      onClose={onClose}
      title="Новая группа бюджета"
      fields={[
        { name: 'groupName', label: 'Название группы', type: 'text', placeholder: 'Например: Учёба' },
        { name: 'budgetAmount', label: 'Сумма бюджета', type: 'number', placeholder: 'Введите сумму' },
      ]}
      onSubmit={(values) => {
        // достаем поля и передаем их в мутацию
        const groupName = values.groupName ?? '';
        const budgetAmount = parseFloat(values.budgetAmount ?? '0');

        createBudget.mutate({
          name: groupName,
          amount: budgetAmount,
        });
      }}
    />
  );
};
