'use client';

import { AddEntityModal } from './baseAdd';
import { api } from '~/trpc/react';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string; // ID выбранного бюджета
  onInvite: (message: string) => void; // Коллбек для обновления состояния родителя
}

export const InviteUserModal = ({
  isOpen,
  onClose,
  onInvite,
  budgetId,
}: InviteUserModalProps) => {
  // Мутация для приглашения пользователя в бюджет
  const inviteUser = api.budget.inviteToBudget.useMutation({
    onSuccess: (data) => {
      if (data?.error) {
        alert(data.error); // Показываем ошибку, если есть
      } else if (data?.message) {
        alert(data.message); // Показываем успех, если есть
        onInvite(data.message || 'Пользователь успешно добавлен'); // Вызываем onInvite для обновления состояния
        onClose(); // Закрываем модальное окно
      }
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
            alert('Бюджет не выбран'); // Уведомление, если бюджет не выбран
            return;
          }
          inviteUser.mutate({ email, budgetId }); // Вызов мутации для добавления пользователя в бюджет
        } else {
          alert('Введите email пользователя'); // Если email пустой
        }
      }}
    />
  );
};
