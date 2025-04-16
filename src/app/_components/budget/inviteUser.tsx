'use client';

import { AddEntityModal } from './baseAdd';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string) => void;
}

export const InviteUserModal = ({
  isOpen,
  onClose,
  onInvite,
}: InviteUserModalProps) => {
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
          onInvite(email);
        }
      }}
    />
  );
};
