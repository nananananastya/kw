'use client';

import React, { useState, useEffect, useRef } from 'react';
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

  const refetchCategories = useRef<() => void>(() => {});

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
      } else if (data?.message) {
        toast.success(data.message);
        setSelectedGroupId(null);
        refetch();
      }
    },
  });

  const utils = api.useUtils();

  const { mutateAsync: addCategory } = api.category.addCategoryToBudget.useMutation({
    onSuccess: () => {
      if (selectedGroupId) {
        utils.category.getCategoriesWithExpenses.invalidate(selectedGroupId);
      }
    },
  });

  const handleAddCategory = async (name: string, limit: number, budgetId: string) => {

    await addCategory({ name, limit, budgetId });
    utils.category.getCategoriesWithExpenses.invalidate(budgetId);
  };

  const handleOwnerAction = (isOwner: boolean, action: () => void, errorMessage: string) => {
    if (!isOwner) {
      toast.error(errorMessage);
      return;
    }
    action();
  };

  const buttonStyle = 'px-4 py-2 rounded-full font-medium transition-colors duration-200 text-sm md:text-base';
  const activeStyle = 'bg-gradient-to-r from-pink-400 to-purple-500 text-white';
  const inactiveStyle = 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const currentGroup = groups.find((g) => g.id === selectedGroupId);
  const userRole = currentGroup?.userRole;
  const isOwner = userRole === 'OWNER';

  if (isLoading) return <div className="text-gray-500">Загрузка групп...</div>;

  return (
    <div>
      <Toaster />
      {selectedGroupId && <BudgetSummaryCard budgetId={selectedGroupId} />}
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
              onClick={() => handleOwnerAction(isOwner, () => setIsInviteModalOpen(true), "Только владелец может приглашать участников")}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              title="Пригласить участника"
            >
              <GoPersonAdd className="w-5 h-5 text-gray-700" />
            </button>
            {selectedGroupId && (
              <button
                onClick={() => setIsMembersModalOpen(true)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                title="Участники бюджета"
              >
                <GoPeople className="w-5 h-5 text-gray-700" />
              </button>
            )}
            {selectedGroupId && (
              <button
                onClick={() => handleOwnerAction(isOwner, () => {
                  const isConfirmed = window.confirm("Точно удалить бюджет?");
                  if (isConfirmed) {
                    deleteBudget.mutate({ budgetId: selectedGroupId });
                  }
                }, "Удалить бюджет может только владелец")}
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

        {selectedGroupId && (
          <CategoryList
            budgetId={selectedGroupId}
            setAddCategoryModalOpen={() => handleOwnerAction(isOwner, () => setAddCategoryModalOpen(true), "Добавлять категории может только владелец")}
            refetchCategories={refetchCategories}
            isOwner={isOwner}
          />
        )}

        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={(email) => {
            setIsInviteModalOpen(false);
          }}
          budgetId={selectedGroupId!}
        />

        <AddBudgetModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onAddGroup={(id, name) => {
            console.log("Добавлена группа:", id, name);
          }}
        />

        <AddCategoryModal
          isOpen={isAddCategoryModalOpen}
          onClose={() => setAddCategoryModalOpen(false)}
          onAdd={handleAddCategory}
          budgetId={selectedGroupId!}
        />
        <BudgetMembersModal
          isOpen={isMembersModalOpen}
          onClose={() => setIsMembersModalOpen(false)}
          budgetId={selectedGroupId!}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
};