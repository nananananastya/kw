import { describe, it, vi, beforeEach, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import EditCategoryModal from '../src/app/_components/budget/editCategory'; 
import { Category } from '@prisma/client'; 
import React from 'react';

describe('EditCategoryModal', () => {
  const onClose = vi.fn();
  const onSave = vi.fn();
  const onDelete = vi.fn();

  const category: Category = {
    id: '1',
    name: 'Food',
    limit: 1000,
    budgetId: '123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it('рендерит поля с переданными значениями', () => {
    render(
      <EditCategoryModal
        isOpen={true}
        onClose={onClose}
        category={category}
        onSave={onSave}
        onDelete={onDelete}
      />
    );

    // Проверяем, что название и лимит категории отображаются в полях
    expect(screen.getByDisplayValue(category.name)).toBeDefined();
    expect(screen.getByDisplayValue(category.limit.toString())).toBeDefined();
  });

  it('редактирование названия категории и лимита', () => {
    render(
      <EditCategoryModal
        isOpen={true}
        onClose={onClose}
        category={category}
        onSave={onSave}
        onDelete={onDelete}
      />
    );

    // Меняем название и лимит
    fireEvent.change(screen.getByDisplayValue(category.name), {
      target: { value: 'Groceries' },
    });

    fireEvent.change(screen.getByDisplayValue(category.limit.toString()), {
      target: { value: '2000' },
    });

    // Проверяем, что значения изменены
    expect(screen.getByDisplayValue('Groceries')).toBeDefined();
    expect(screen.getByDisplayValue('2000')).toBeDefined();
  });

  it('вызывается onSave при сабмите формы с правильными значениями', async () => {
    render(
      <EditCategoryModal
        isOpen={true}
        onClose={onClose}
        category={category}
        onSave={onSave}
        onDelete={onDelete}
      />
    );

    // Изменяем название и лимит
    fireEvent.change(screen.getByDisplayValue(category.name), {
      target: { value: 'Groceries' },
    });

    fireEvent.change(screen.getByDisplayValue(category.limit.toString()), {
      target: { value: '2000' },
    });

    // Сабмитим форму
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Сохранить/i }));
    });

    // Проверяем, что onSave был вызван с правильными аргументами
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(category.id, 'Groceries', 2000);
    });

    // Проверяем, что окно закрылось
    expect(onClose).toHaveBeenCalled();
  });

  it('вызывается onDelete при удалении категории', async () => {
    render(
      <EditCategoryModal
        isOpen={true}
        onClose={onClose}
        category={category}
        onSave={onSave}
        onDelete={onDelete}
      />
    );

    // Вызываем удаление
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /удалить/i }));
    });

    // Проверяем, что onDelete был вызван с правильным id
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(category.id);
    });

    // Проверяем, что окно закрылось
    expect(onClose).toHaveBeenCalled();
  });
});
