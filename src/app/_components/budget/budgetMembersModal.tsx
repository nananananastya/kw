'use client';
import React from 'react';
import { api } from '~/trpc/react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string | null;
  isOwner: boolean;
}

export const BudgetMembersModal: React.FC<Props> = ({
  isOpen,
  onClose,
  budgetId,
  isOwner,
}) => {
  const { data: members = [], refetch } = api.budget.getBudgetMembers.useQuery(
    { budgetId: budgetId ?? '' },
    {
      enabled: !!budgetId,
    }
  );

  const { mutate: removeUser } = api.budget.removeUserFromBudget.useMutation({
    onSuccess: () => {
      toast.success('Участник удалён');
      refetch();
    },
    onError: () => {
      toast.error('Ошибка при удалении участника');
    },
  });

  if (!budgetId) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/50 p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Участники бюджета
          </Dialog.Title>
          <ul className="space-y-4">
            {members.map((member) => (
              <li key={member.user.id} className="flex justify-between items-center  ">              
                  <span>{member.user.email ?? 'Без email'}</span>
                  {member.role === 'OWNER' && (
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l text-white px-3 py-1 rounded-full">
                      владелец
                    </span>
                  )}             
                {isOwner && member.role !== 'OWNER' && (
                  <button
                    onClick={() =>
                      removeUser({ budgetId, userId: member.user.id })
                    }
                    className="text-pink-500 hover:underline text-sm"
                  >
                    Удалить
                  </button>
                )}
              </li>
            ))}
          </ul>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md"
          >
            Закрыть
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
