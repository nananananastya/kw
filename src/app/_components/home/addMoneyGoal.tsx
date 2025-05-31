'use client';

import React, { useState } from 'react';
import { api } from '~/trpc/react';
import { Button } from '../button';
import { Input } from '../input';
import { Select } from '../select';
import { toast } from 'react-hot-toast';

interface AddMoneyToGoalModalProps {
  goalId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMoneyToGoalModal ({ goalId, isOpen, onClose }: AddMoneyToGoalModalProps) {
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>(''); 
  const { data: userBudgets = [], isLoading } = api.budget.getUserBudgets.useQuery();
  const decreaseBudgetMutation = api.budget.decreaseBudgetBalance.useMutation();
  const utils = api.useUtils();

  const addMoneyMutation = api.goal.addAmountToGoal.useMutation({
    onSuccess: () => {
      toast.success('Деньги успешно добавлены в цель');
      utils.goal.getUserGoals.invalidate();
      utils.budget.summary.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error('Ошибка при добавлении денег: ' + error.message);
    },
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleAddMoney = () => {
    const numericAmount = parseFloat(amount);
    if (!selectedBudgetId || isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Выберите бюджет и введите корректную сумму.');
      return;
    }

    const selectedBudget = userBudgets.find(b => b.id === selectedBudgetId);
    if (!selectedBudget) {
      toast.error('Выбранный бюджет не найден.');
      return;
    }

    if (selectedBudget.amount === null || numericAmount > selectedBudget.amount) {
      toast.error('Недостаточно средств в бюджете.');
      return;
    }

    try {
      decreaseBudgetMutation.mutate({
        budgetId: selectedBudgetId,
        amount: numericAmount,
      });

      addMoneyMutation.mutate({
        goalId,
        amountToAdd: numericAmount,
      });
    } catch (error) {
      toast.error('Произошла ошибка при переводе денег.');
    }
  };

  const budgetOptions = userBudgets.map((budget) => ({
    label: `${budget.name}`,
    value: budget.id,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Добавить деньги в цель</h2>

        {isLoading ? (
          <p>Загрузка бюджетов...</p>
        ) : (
          <div className="mb-4">
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
              Выберите бюджет
            </label>
            <Select
              id="budget"
              value={selectedBudgetId || ''}
              onChange={(e) => setSelectedBudgetId(e.target.value)}
              options={budgetOptions}
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Сумма</label>
          <Input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Сумма для добавления"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">
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