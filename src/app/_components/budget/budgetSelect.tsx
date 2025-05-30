'use client';

import React, { useState, useEffect } from 'react';
import { api } from "~/trpc/react";
import { InviteUserModal } from './inviteUser';
import { AddBudgetModal } from './addBudget';
import { GoPlus, GoPersonAdd, GoTrash, GoPeople } from 'react-icons/go';
import { CategoryList } from './categoryList';
import { AddCategoryModal } from './addCategory';
import { toast, Toaster } from 'react-hot-toast';
import { BudgetSummaryCard } from './budgetSummaryCard';
import { BudgetMembersModal } from './budgetMembersModal';

export default function BudgetSelect() {
  const { data: groups = [], isLoading, refetch } = api.budget.getUserBudgets.useQuery();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [categoryType, setCategoryType] = useState<'INCOME' | 'EXPENSE' | null>(null);

    useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      const firstBudget = groups[0];
      if (firstBudget?.id) {
        setSelectedGroupId(firstBudget.id);
      }
    }
  }, [groups, selectedGroupId]);


  const deleteBudget = api.budget.deleteBudget.useMutation({
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success(data.message!);
        setSelectedGroupId(null);
        refetch();
      }
    },
  });

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const currentGroup = groups.find(g => g.id === selectedGroupId);
  const userRole = currentGroup?.userRole;
  const isOwner = userRole === 'OWNER';

  if (isLoading) return <div className="text-gray-500">Загрузка групп...</div>;

  return (
  <div>
    <Toaster />

    {/* Сводка по бюджету */}
    {selectedGroupId && (
        <BudgetSummaryCard budgetId={selectedGroupId} />
    )}
    {/* Контейнер для кнопок управления и списка групп */}
    <div className="container mx-auto bg-white shadow-lg rounded-xl p-4 w-full mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-700">Группа бюджета</h2>
        <div className="flex gap-3">
          {/* кнопки */}
          <button onClick={() => setIsCreateModalOpen(true)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition" title="Создать группу">
            <GoPlus className="w-5 h-5 text-gray-700" />
          </button>

          {isOwner && (
            <button onClick={() => setIsInviteModalOpen(true)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition" title="Пригласить участника">
              <GoPersonAdd className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {selectedGroupId && (
            <button onClick={() => setIsMembersModalOpen(true)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition" title="Участники бюджета">
              <GoPeople className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {isOwner && selectedGroupId && (
            <button onClick={() => {
              if (confirm("Точно удалить бюджет?")) {
                deleteBudget.mutate({ budgetId: selectedGroupId });
              }
            }} className="p-2 rounded-full bg-purple-100 hover:bg-pink-200 transition" title="Удалить бюджет">
              <GoTrash className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Список кнопок групп */}
      <div className="flex flex-wrap gap-4 mb-2">
        {groups.map(group => (
          <button key={group.id}
            onClick={() => handleGroupChange(group.id)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedGroupId === group.id
                ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>
    </div>

    {/* Категории (разделённые контейнеры) */}
    {selectedGroupId && (
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="container mx-auto bg-white shadow-lg rounded-xl p-4 w-full mb-6">
          <CategoryList
            budgetId={selectedGroupId}
            type="EXPENSE"
            setAddCategoryModalOpen={() => {
              setCategoryType("EXPENSE");
              setAddCategoryModalOpen(true);
            }}
            isOwner={isOwner}
          />
        </div>

        <div className="container mx-auto bg-white shadow-lg rounded-xl p-4 w-full mb-6">
          <CategoryList
            budgetId={selectedGroupId}
            type="INCOME"
            setAddCategoryModalOpen={() => {
              setCategoryType("INCOME");
              setAddCategoryModalOpen(true);
            }}
            isOwner={isOwner}
          />
        </div>
      </div>
    )}

    {/* Модалки */}
    <InviteUserModal
      isOpen={isInviteModalOpen}
      onClose={() => setIsInviteModalOpen(false)}
      onInvite={(email) => setIsInviteModalOpen(false)}
      budgetId={selectedGroupId!}
    />

    <AddBudgetModal
      isOpen={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
    />

    <AddCategoryModal
      isOpen={isAddCategoryModalOpen}
      onClose={() => {
        setAddCategoryModalOpen(false);
        setCategoryType(null);
      }}
      budgetId={selectedGroupId!}
      type={categoryType!}
    />

    <BudgetMembersModal
      isOpen={isMembersModalOpen}
      onClose={() => setIsMembersModalOpen(false)}
      budgetId={selectedGroupId!}
      isOwner={isOwner}
    />
  </div>
)}