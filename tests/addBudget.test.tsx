import { describe, it, vi, beforeEach, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { AddBudgetModal } from '../src/app/_components/budget/addBudget';
import { api } from '~/trpc/react';
import React from 'react';


// Это нужно, чтобы в тестах не использовать настоящие API-вызовы
vi.mock('~/trpc/react', () => ({
  api: {
    useUtils: vi.fn(), // Мокаем хук для управления кэшем
    budget: {
      create: {
        useMutation: vi.fn(), // Мокаем мутацию для создания бюджета
      },
    },
  },
}));

describe('AddBudgetModal', () => {
  // Мок-функции, передаваемые в компонент
  const onClose = vi.fn();      // Закрывает модалку

  const mockInvalidate = vi.fn();  // Проверим был ли вызван invalidate 
  const mockMutate = vi.fn();      // Проверим был ли вызван mutate 

  //  выполняется перед каждым тестом
  beforeEach(() => {
    vi.clearAllMocks(); // Сбрасываем историю вызовов всех mock-функций

    // Подменяем поведение хука api.useUtils()
    (api.useUtils as any).mockReturnValue({
      budget: {
        getUserBudgets: {
          invalidate: mockInvalidate, // Вместо настоящей invalidate используем мок
        },
      },
    });

    // Подменяем поведение хука useMutation
    (api.budget.create.useMutation as any).mockImplementation(
      (options: { onSuccess: () => void }) => ({
        mutate: (data: any) => {
          mockMutate(data);        // Сохраняем данные вызова для проверки
          options.onSuccess();     // Симулируем успешную мутацию 
        },
      })
    );
  });

  // выполняется после каждого теста — удаляет DOM
  afterEach(cleanup);

  it('появление кнопки и полей ввода', () => {
    render(
      <AddBudgetModal
        isOpen={true} // Открываем модалку
        onClose={onClose}
      />
    );

    // Проверяем, что отображаются нужные элементы
    expect(screen.getByPlaceholderText('Например: Учёба')).toBeDefined();   // Название бюджета
    expect(screen.getByPlaceholderText('Введите сумму')).toBeDefined();    // Сумма бюджета
    expect(screen.getByRole('button', { name: /Добавить/i })).toBeDefined(); // Кнопка отправки
  });

  it('сабмит формы и вызов onClose и invalidate', async () => {
    render(
      <AddBudgetModal
        isOpen={true}
        onClose={onClose}
      />
    );

    // Симулируем ввод в поле названия
    fireEvent.change(screen.getByPlaceholderText('Например: Учёба'), {
      target: { value: 'Учёба' },
    });

    fireEvent.change(screen.getByPlaceholderText('Введите сумму'), {
      target: { value: '5000' },
    });

    // Сабмит формы: кликаем по кнопке
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Добавить/i }));
    });

    // Ждём, пока вызовы произойдут (асинхронно)
    await waitFor(() => {
      // Проверяем, что mutate был вызван с правильными данными
      expect(mockMutate).toHaveBeenCalledWith({
        name: 'Учёба',
        amount: 5000,
      });

      // Проверяем, что invalidate был вызван 
      expect(mockInvalidate).toHaveBeenCalled();

      // Проверяем, что модалка была закрыта
      expect(onClose).toHaveBeenCalled();
    });
  });
});
