'use client';

import { AddEntityModal } from './baseAdd'; 

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (values: Record<string, string | number | Date | undefined>) => void;
}

export const AddGoalModal = ({ isOpen, onClose, onAddGoal }: AddGoalModalProps) => {
  const fields = [
    {
      name: 'name',
      label: 'Название цели',
      type: 'text' as 'text',
      placeholder: 'Введите название цели',
    },
    {
      name: 'targetAmount',
      label: ' Целевая сумма',
      type: 'number' as 'number',
      placeholder: 'Введите сумму',
    },
    {
      name: 'targetDate',
      label: 'Дата завершения',
      type: 'date' as 'date',
    },
  ];

  const handleSubmit = (values: Record<string, string | number | Date | undefined>) => {
    const goalData = {
      name: values.name || '',  // Если name отсутствует, заменяем на пустую строку
      targetAmount: Number(values.targetAmount),  // Преобразуем targetAmount в число
      targetDate: values.targetDate ? new Date(values.targetDate) : undefined,  // Проверяем targetDate
    };

    onAddGoal(goalData);  // Передаем данные в родительский компонент
  };

  return (
    <AddEntityModal
      isOpen={isOpen}
      onClose={onClose}
      title="Добавить финансовую цель"
      fields={fields}
      onSubmit={handleSubmit}
    />
  );
};
