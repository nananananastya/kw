'use client';

import React, { useState } from 'react';
import { GoPlus } from 'react-icons/go';
import { TbPigMoney } from "react-icons/tb";
import { api } from '~/trpc/react';
import ItemList from './itemList';
import EditGoalModal from './editGoal';
import { AddGoalModal } from './addGoal';
import AddMoneyToGoalModal from './addMoneyGoal';

type GoalInput = {
  name?: string;
  targetAmount?: number | string;
  targetDate?: Date | string;
};

export default function FinancialGoalsList() {
  const { data: financialGoals = [], isLoading, error } = api.goal.getUserGoals.useQuery();
  
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<any>(null); 
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState<string | null>(null);  

  const utils = api.useUtils();

  const deleteGoal = api.goal.deleteGoal.useMutation({
    onSuccess: () => {
      utils.goal.getUserGoals.invalidate();
      setIsEditModalOpen(false); 
    },
  });

  const addGoal = api.goal.addGoal.useMutation({
    onSuccess: () => {
      utils.goal.getUserGoals.invalidate();
      setIsAddGoalModalOpen(false);
    },
  });

  const updateGoal = api.goal.updateGoal.useMutation({
  onSuccess: () => {
    utils.goal.getUserGoals.invalidate();
    setIsEditModalOpen(false);
  },
});

  const handleGoalClick = (goal: any) => {
    setGoalToEdit(goal);  
    setIsEditModalOpen(true);  
  };

  const handleSaveGoal = (id: string, name: string, targetAmount: number, targetDate: Date) => {
    updateGoal.mutate({
      id,
      name,
      targetAmount,
      currentAmount: goalToEdit.currentAmount,
      targetDate,
    });
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal.mutate({ id });
  };

  const handleAddGoal = (goalData: GoalInput) => {
    const formattedGoalData = {
      name: String(goalData.name || ''), 
      targetAmount: Number(goalData.targetAmount),
      targetDate: goalData.targetDate ? new Date(goalData.targetDate) : new Date(),
      currentAmount: 0,
    };

    addGoal.mutate(formattedGoalData);
  };

  if (isLoading) return <div>Загрузка целей...</div>;
  if (error) return <div>Ошибка при загрузке целей. Попробуйте позже.</div>;

  const handleAddGoalModalToggle = () => {
    setIsAddGoalModalOpen(true);
  };

  const handleAddMoneyClick = (goalId: string, e: React.MouseEvent) => {
    e.stopPropagation();  
    setIsAddMoneyModalOpen(goalId);  
  };

  return (
    <div className="mt-6">
      <ItemList
        items={financialGoals}
        keyExtractor={(goal) => goal.id}
        title={
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Финансовые цели</h2>
            <button
              onClick={handleAddGoalModalToggle}  
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              title="Добавить цель"
            >
              <GoPlus className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        }
        renderItem={(goal) => (
          <div
            className="flex items-center justify-between py-2 border-b border-gray-200 cursor-pointer"
            onClick={() => handleGoalClick(goal)} 
          >
            <div className="flex flex-col">
              <p className="text-gray-700">{goal.name}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>Накоплено</span>
                <span className="mx-1">{goal.currentAmount}</span>
                <span>из</span>
                <span className="mx-1">{goal.targetAmount}</span>
              </div>
            </div>
            <div className="flex justify-end items-center w-full space-x-4">
              <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${(goal.currentAmount / goal.targetAmount) * 100}%`,
                  }}
                />
              </div>
              <button
                onClick={(e) => handleAddMoneyClick(goal.id, e)} 
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                title="Накопить"
              >
                <TbPigMoney className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        )}
      />
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        onAddGoal={handleAddGoal}
      />
      {goalToEdit && (
        <EditGoalModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          goal={goalToEdit}
          onSave={handleSaveGoal}
          onDelete={handleDeleteGoal}
        />
      )}

      {isAddMoneyModalOpen && (
        <AddMoneyToGoalModal
          goalId={isAddMoneyModalOpen}
          isOpen={true}
          onClose={() => setIsAddMoneyModalOpen(null)}
        />
      )}
    </div>
  );
};