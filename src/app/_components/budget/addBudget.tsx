'use client';

import { AddEntityModal } from './baseAdd';
import { createBudget } from '~/app/api/action/budget';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetCreated: (budget: { id: string; name: string }) => void;
}

export const AddBudgetModal = ({
  isOpen,
  onClose,
  onBudgetCreated,
}: AddBudgetModalProps) => {
  const handleSubmit = async (formData: FormData) => {
    const newBudget = await createBudget(formData);
    onBudgetCreated(newBudget); // сообщаем родителю
    onClose(); // закрываем модалку
  };

  return (
    <AddEntityModal
      isOpen={isOpen}
      onClose={onClose}
      title="Новый бюджет"
      fields={[
        { name: 'name', label: 'Название бюджета', type: 'text', placeholder: 'Например: Учёба' },
        { name: 'amount', label: 'Сумма бюджета', type: 'number', placeholder: 'Например: 10000' },
      ]}
      onSubmit={handleSubmit}
      action={createBudget}
    />
  );
};
