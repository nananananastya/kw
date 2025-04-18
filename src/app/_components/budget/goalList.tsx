'use client';

import React, { useState } from 'react';
import { GoPlus } from 'react-icons/go';
import { api } from '~/trpc/react';  // Путь к вашему API
import ItemList from './itemList';  // Путь к вашему компоненту ItemList
import EditGoalModal from './editGoal';  // Путь к компоненту модалки редактирования цели
import { AddGoalModal } from './addGoal';  // Путь к вашему компоненту AddGoalModal

const FinancialGoalsList = () => {
  const { data: financialGoals = [], isLoading, error } = api.budget.getUserGoals.useQuery();  // Получаем данные целей из API
  
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);  // Состояние для открытия модалки добавления цели
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);  // Состояние для открытия модалки редактирования цели
  const [goalToEdit, setGoalToEdit] = useState(null);  // Данные цели для редактирования

  const utils = api.useUtils();

  const deleteGoal = api.budget.deleteGoal.useMutation({
    onSuccess: () => {
      utils.budget.getUserGoals.invalidate();  // Обновляем список целей
      setIsEditModalOpen(false);  // Закрываем модалку редактирования
    },
  });

  // Мутация для добавления новой цели
  const addGoal = api.budget.addGoal.useMutation({
    onSuccess: () => {
      utils.budget.getUserGoals.invalidate();  // Обновляем список целей
      setIsAddGoalModalOpen(false);  // Закрываем модалку добавления цели
    },
  });

  if (isLoading) return <div>Загрузка целей...</div>;
  if (error) {
    console.error("Ошибка при загрузке целей:", error);
    return <div>Ошибка при загрузке целей. Попробуйте позже.</div>;
  }

  const handleGoalClick = (goal: any) => {
    setGoalToEdit(goal);  // Устанавливаем цель для редактирования
    setIsEditModalOpen(true);  // Открываем модалку редактирования
  };

  const handleSaveGoal = (id: string, name: string) => {
    // Логика для сохранения измененной цели
    console.log("Сохранение изменений для цели:", id, name);
    setIsEditModalOpen(false);  // Закрытие модалки
  };

  const handleDeleteGoal = (id: string) => {
      deleteGoal.mutate({ id });
  };

  const handleAddGoal = (goalData: Record<string, string | number | Date | undefined>) => {
    // Преобразуем данные в нужный формат
    const formattedGoalData = {
      name: String(goalData.name || ''),  // Преобразуем в строку
      targetAmount: Number(goalData.targetAmount),  // Преобразуем targetAmount в число
      targetDate: goalData.targetDate ? new Date(goalData.targetDate) : new Date(),  // Если targetDate не задан, установим текущее время
      currentAmount: 0,  // Начальная сумма
    };
  
    // Отправляем данные в мутацию
    addGoal.mutate(formattedGoalData);
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
              onClick={() => setIsAddGoalModalOpen(true)}  // Открытие модалки для добавления цели
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
            <div>
              <p className="text-gray-700">{goal.name}</p>
              <p className="text-sm text-gray-500">Прогресс: 70%</p>
            </div>
            <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{
                  width: `70%`,  // Прогресс (можно заменить на динамический)
                }}
              />
            </div>
          </div>
        )}
      />

      {/* Модальное окно для добавления цели */}
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        onAddGoal={handleAddGoal}  // Обработчик добавления новой цели
      />

      {/* Модальное окно для редактирования цели */}
      {goalToEdit && (
        <EditGoalModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          goal={goalToEdit}
          onSave={handleSaveGoal}
          onDelete={handleDeleteGoal}  // Возможность удалить цель
        />
      )}
    </div>
  );
};

export default FinancialGoalsList;
