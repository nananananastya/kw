'use client';

import React, { useState } from 'react';
import { api } from '~/trpc/react';
import { Button } from '../button';
import { Input } from '../input';
import { Select } from '../select';

interface AddMoneyToGoalModalProps {
  goalId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AddMoneyToGoalModal: React.FC<AddMoneyToGoalModalProps> = ({ goalId, isOpen, onClose }) => {
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const { data: userBudgets = [], isLoading } = api.budget.getUserBudgets.useQuery();
  
  const utils = api.useUtils();
  
  const addMoneyMutation = api.budget.addAmountToGoal.useMutation({
    onSuccess: () => {
      console.log('Деньги добавлены успешно');
      utils.budget.getUserGoals.invalidate();  // Перезапрашиваем данные целей
      onClose();  // Закрыть модальное окно
    },
    onError: (error) => {
      console.error('Ошибка при добавлении денег:', error);
    },
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  const handleAddMoney = () => {
    if (amount > 0 && selectedBudgetId) {
      addMoneyMutation.mutate({ goalId, amountToAdd: amount });
    } else {
      alert('Пожалуйста, выберите бюджет и введите сумму.');
    }
  };

  const budgetOptions = userBudgets.map((budget) => ({
    label: `${budget.name} `,
    value: budget.id,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Добавить деньги в цель</h2>

{isLoading ? (
        <p>Загрузка бюджетов...</p>
      ) : (
        <div className="mb-4">
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Выберите бюджет</label>
          <Select
            id="budget"
            value={selectedBudgetId || ''}
            onChange={(e) => setSelectedBudgetId(e.target.value)}
            options={budgetOptions} // Передаем сюда массив с вариантами
          />
        </div>
      )}

        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Сумма</label>
          <Input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Сумма для добавления"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-200 px-4 py-2 rounded-md"
          >
            Отмена
          </button>
          <Button onClick={handleAddMoney}>
            Добавить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddMoneyToGoalModal;
