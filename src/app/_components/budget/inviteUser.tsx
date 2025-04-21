'use client';

import { AddEntityModal } from './baseAdd';
import { api } from '~/trpc/react';
import { toast } from 'react-hot-toast';
import { TRPCClientError } from '@trpc/client';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string;
  onInvite: (message: string) => void;
}

export const InviteUserModal = ({
  isOpen,
  onClose,
  onInvite,
  budgetId,
}: InviteUserModalProps) => {
  const inviteUser = api.budget.inviteToBudget.useMutation({
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error); // показываем ошибку, если есть
        return;
      }
  
      if (data?.message) {
        toast.success(data.message);
        onInvite(data.message);
        onClose();
      }
    },
    onError: (error) => {
      // теоретически сюда не попадём, но пусть будет
      const errorMessage =
        error instanceof TRPCClientError
          ? error.message || 'Ошибка при добавлении пользователя'
          : 'Неизвестная ошибка';
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
            toast.error('Бюджет не выбран'); // Показываем ошибку, если не выбран бюджет
            return;
          }
          inviteUser.mutate({ email, budgetId }); // Вызываем мутацию для добавления пользователя
        } else {
          toast.error('Введите email пользователя');
        }
      }}
    />
  );
};
