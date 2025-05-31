'use client';

import { AddEntityModal } from './baseAdd';
import { api } from '~/trpc/react';
import { toast } from 'react-hot-toast';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string;
  onInvite: (message: string) => void;
}

export function InviteUserModal ({ isOpen, onClose, onInvite, budgetId }: InviteUserModalProps) {

  // для того, чтобы обновить участников после приглашения
  const { refetch } = api.budget.getBudgetMembers.useQuery(
    { budgetId },
    { enabled: !!budgetId } 
  );

  const inviteUser = api.budget.inviteToBudget.useMutation({
    onSuccess: (data) => {
      // если участника нет в бд или т.п ошибки 
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.message) {
        toast.success(data.message);
        onInvite(data.message);
        onClose();
      }
      refetch();
    },
    // другие ошибки 
    onError: (error) => {
      const errorMessage =
        error?.message || 'Ошибка при добавлении пользователя';
      toast.error(errorMessage);
    },
  });

  return (
    <AddEntityModal
      isOpen={isOpen}
      onClose={onClose}
      title="Пригласить участника"
      fields={[
        {
          name: 'email',
          label: 'Email пользователя',
          type: 'text',
          placeholder: 'example@mail.com',
        },
      ]}
      onSubmit={(values) => {
        const email = values.email?.trim();
        if (email) {
          if (!budgetId) {
            toast.error('Бюджет не выбран');
            return;
          }
          inviteUser.mutate({ email, budgetId });
        } else {
          toast.error('Введите email пользователя');
        }
      }}
    />
  );
};
