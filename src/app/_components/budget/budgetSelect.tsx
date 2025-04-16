'use client';

import React, { useEffect, useState } from 'react';
import { InviteUserModal } from './inviteUser';
import { AddBudgetModal } from './addBudget';
import { GoPlus, GoPersonAdd } from 'react-icons/go';
import { createBudget } from '~/app/api/action/budget'; // путь может отличаться

interface Budget {
  id: string;
  name: string;
}

interface BudgetSelectProps {
  budgets: Budget[]; 
  selectedBudgetId: string | null;
}

export const BudgetSelect: React.FC<BudgetSelectProps> = ({ budgets: initialBudgets, selectedBudgetId }) => {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(selectedBudgetId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleBudgetChange = (budgetId: string) => {
    setSelectedBudget(budgetId);
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-full transition-all duration-300 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-700">Бюджет</h2> {/* Изменено на "Бюджет" */}
        <div className="flex gap-3">
          <button
            onClick={() =>setIsCreateModalOpen(true)}
            
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            title="Создать бюджет"
          >
            <GoPlus className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            title="Пригласить участника"
          >
            <GoPersonAdd className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {budgets.map((budget) => (
          <button
            key={budget.id}
            onClick={() => handleBudgetChange(budget.id)} // Изменено на budget
            className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 text-sm md:text-base ${
              selectedBudget === budget.id // Изменено на budget
                ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {budget.name} {/* Изменено на budget */}
          </button>
        ))}
      </div>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={(email) => {
          console.log('Пригласить:', email);
          setIsInviteModalOpen(false);
        }}
      />

    <AddBudgetModal
      isOpen={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      onBudgetCreated={(newBudget) => {
        setBudgets((prev) => [...prev, newBudget]);
        setSelectedBudget(newBudget.id); // Сделать активным сразу
        setIsCreateModalOpen(false); // Закрыть модалку
      }}
    />

    </div>
  );
};