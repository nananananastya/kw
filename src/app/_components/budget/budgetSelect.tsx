'use client';

import React, { useState } from 'react';
import { api } from "~/trpc/react";
import { InviteUserModal } from './inviteUser';
import { AddBudgetModal } from './addBudget';
import { GoPlus, GoPersonAdd, GoTrash } from 'react-icons/go';

const BudgetSelect: React.FC = () => {
  const { data: groups = [], isLoading, refetch } = api.budget.getUserBudgets.useQuery();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const deleteBudget = api.budget.deleteBudget.useMutation({
    onSuccess: (data) => {
      if (data?.error) {
        alert(data.error); // Ошибка при удалении бюджета
      } else if (data?.message) {
        alert(data.message); // Уведомление об успешном удалении
        setSelectedGroupId(null); // Сбрасываем выбранный бюджет
        refetch(); // Перезапрос данных
      }
    },
  });

  const buttonStyle = 'px-4 py-2 rounded-full font-medium transition-colors duration-200 text-sm md:text-base';
  const activeStyle = 'bg-gradient-to-r from-pink-400 to-purple-500 text-white';
  const inactiveStyle = 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  if (isLoading) return <div className="text-gray-500">Загрузка групп...</div>;

  return (
    <div className="container mx-auto bg-white shadow-lg rounded-xl p-4 w-full transition-all duration-300 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-700">Группа бюджета</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            title="Создать группу"
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
          {selectedGroupId && (
            <button
              onClick={() => {
                if (selectedGroupId) {
                  deleteBudget.mutate({ budgetId: selectedGroupId });
                }
              }}
              className="p-2 rounded-full bg-purple-100 hover:bg-pink-200 transition"
              title="Удалить бюджет"
            >
              <GoTrash className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => handleGroupChange(group.id)}
            className={`${buttonStyle} ${selectedGroupId === group.id ? activeStyle : inactiveStyle}`}
          >
            {group.name}
          </button>
        ))}
      </div>

      {/* Передаем budgetId в InviteUserModal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={(email) => {
          console.log('Пригласить:', email);
          setIsInviteModalOpen(false);
        }}
        budgetId={selectedGroupId!} // Здесь передаем выбранный бюджет
      />
      <AddBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddGroup={(id, name) => {
          console.log("Добавлена группа:", id, name);
          // возможно, invalidate или setState
        }}
      />
    </div>
  );
};

export default BudgetSelect;
