'use client';

import { AddEntityModal } from '../budget/baseAdd'; 

type GoalFormData = {
  name: string;
  targetAmount: number;
  targetDate?: Date;
};

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (values: GoalFormData) => void;
}

export function AddGoalModal ({ isOpen, onClose, onAddGoal }: AddGoalModalProps) {
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

  const handleSubmit = (values: Partial<GoalFormData>) => {
    const goalData = {
      name: values.name || '',  
      targetAmount: Number(values.targetAmount),  
      targetDate: values.targetDate ? new Date(values.targetDate) : undefined,  
    };

    onAddGoal(goalData);  
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
