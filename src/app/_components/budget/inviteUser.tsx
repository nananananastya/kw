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
  const { refetch } = api.budget.getBudgetMembers.useQuery(
    { budgetId },
    { enabled: !!budgetId } 
  );

  const inviteUser = api.budget.inviteToBudget.useMutation({
    onSuccess: (data) => {
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
    onError: (error) => {
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
