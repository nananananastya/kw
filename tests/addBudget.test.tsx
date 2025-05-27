import { describe, it, vi, beforeEach, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { AddBudgetModal } from '../src/app/_components/budget/addBudget';
import { api } from '~/trpc/react';
import React from 'react';

vi.mock('~/trpc/react', () => ({
  api: {
    useUtils: vi.fn(),
    budget: {
      create: {
        useMutation: vi.fn(),
      },
    },
  },
}));

describe('AddBudgetModal', () => {
  const onClose = vi.fn();
  const onAddGroup = vi.fn();

  const mockInvalidate = vi.fn();
  const mockMutate = vi.fn();


  beforeEach(() => {
    vi.clearAllMocks();
    (api.useUtils as any).mockReturnValue({
      budget: {
        getUserBudgets: {
          invalidate: mockInvalidate,
        },
      },
    });
    (api.budget.create.useMutation as any).mockImplementation(
      (options: { onSuccess: () => void }) => ({
        mutate: (data: any) => {
          mockMutate(data);
          options.onSuccess(); 
        },
      })
    );
  });

  afterEach(cleanup);

  it('появление кнопки и полей ввода', () => {
    render(
      <AddBudgetModal
        isOpen={true}
        onClose={onClose}
      />
    );
    expect(screen.getByPlaceholderText('Например: Учёба')).toBeDefined();
    expect(screen.getByPlaceholderText('Введите сумму')).toBeDefined();
    expect(screen.getByRole('button', { name: /Добавить/i })).toBeDefined();
  });

  it('сабмит формы и вызов onClose и invalidate', async () => {
    render(
      <AddBudgetModal
        isOpen={true}
        onClose={onClose}
      />
    );

    // Вводим данные
    fireEvent.change(screen.getByPlaceholderText('Например: Учёба'), {
      target: { value: 'Учёба' },
    });

    fireEvent.change(screen.getByPlaceholderText('Введите сумму'), {
      target: { value: '5000' },
    });

    // Сабмитим
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Добавить/i }));
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        name: 'Учёба',
        amount: 5000,
      });

      expect(mockInvalidate).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
