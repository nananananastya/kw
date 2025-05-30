'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import ItemList from './itemList';
import { GoPlus } from 'react-icons/go';
import EditCategoryModal from './editCategory';
import { toast } from 'react-hot-toast';
import { CategoryType } from '@prisma/client';
import Pagination from '~/app/ui/pagination';

interface CategoryListProps {
  budgetId: string;
  type: CategoryType;
  setAddCategoryModalOpen: (open: boolean) => void;
  refetchCategories?: { current: () => void };
  isOwner: boolean;
}

interface CategoryWithSpent {
  id: string;
  name: string;
  limit: number;
  spent: number;
  type: CategoryType;
}

export function CategoryList({budgetId, type, setAddCategoryModalOpen, refetchCategories, isOwner}: CategoryListProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const pageParam = type === CategoryType.EXPENSE ? 'expensePage' : 'incomePage';
  const page = Number(searchParams.get(pageParam)) || 1;
  const size = Number(searchParams.get('size')) || 3;

  const { data, isLoading, error, refetch} = api.category.getCategoriesByBudgetAndType.useQuery({ budgetId, type, page, size });

  const categories = data?.categories ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / size);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryWithSpent | null>(null);
  const utils = api.useUtils();

  const updateCategory = api.category.updateCategory.useMutation({
    onSuccess: (data) => {
      data?.error
        ? toast.error(data.error)
        : (toast.success(data.message!), 
        utils.category.getCategoriesByBudgetAndType.invalidate({ budgetId, type }));
    },
  });

  const deleteCategory = api.category.deleteCategory.useMutation({
    onSuccess: (data) => {
      data?.error
        ? toast.error(data.error)
        : (toast.success(data.message!), 
        utils.category.getCategoriesByBudgetAndType.invalidate({ budgetId, type }), 
        setIsEditModalOpen(false));
    },
  });

  useEffect(() => {
    if (refetchCategories) {
      refetchCategories.current = refetch;
    }
  }, [refetch, refetchCategories]);

  const handleCategoryClick = (category: CategoryWithSpent) => {
    if (!isOwner) {
      toast.error('Редактирование категорий доступно только владельцу бюджета');
      return;
    }
    setCategoryToEdit(category);
    setIsEditModalOpen(true);
  };

  const handleSaveCategory = (id: string, name: string, limit: number) => {
    updateCategory.mutate({ id, name, limit });
    setIsEditModalOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (!isOwner) {
      toast.error('Удаление категорий доступно только владельцу бюджета');
      return;
    }
    if (confirm('Точно удалить категорию?')) {
      deleteCategory.mutate({ id });
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    const pageParam = type === CategoryType.EXPENSE ? 'expensePage' : 'incomePage';
    params.set(pageParam, newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (isLoading) return <div>Загрузка категорий...</div>;
  if (error) return <div>Ошибка при загрузке категорий. Попробуйте позже.</div>;

  return (
    <div className="mt-6 flex flex-col" style={{ minHeight: '320px' }}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-700">
          {type === CategoryType.INCOME ? 'Категории доходов' : 'Категории расходов'}
        </h2>
        {isOwner && (
          <button
            onClick={() => setAddCategoryModalOpen(true)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            title="Добавить категорию"
          >
            <GoPlus className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Список категорий — занимает максимум пространства и скроллится при необходимости */}
      <div className="flex-grow overflow-auto">
        <ItemList
          items={categories}
          keyExtractor={(cat) => cat.id}
          renderItem={(cat) => {
            const progress = Math.min((cat.spent / cat.limit) * 100, 100);
            const isOver = cat.spent > cat.limit;
            const progressColor =
              type === CategoryType.INCOME
                ? cat.spent >= cat.limit
                  ? 'bg-green-600'
                  : 'bg-purple-400'
                : isOver
                ? 'bg-red-500'
                : 'bg-pink-400';

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => handleCategoryClick(cat)}
              >
                <div>
                  <p className="text-gray-700">{cat.name}</p>
                  <p className="text-sm text-gray-500">
                    {type === CategoryType.INCOME ? 'Получено' : 'Потрачено'}:{' '}
                    <span className={isOver ? 'text-red-500 font-medium' : ''}>
                      ₽{cat.spent.toFixed(2)}
                    </span>{' '}
                    из ₽{cat.limit.toFixed(2)}
                  </p>
                </div>
                <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className={progressColor} style={{ width: `${progress}%`, height: '100%' }} />
                </div>
              </div>
            );
          }}
        />
      </div>
      {/* Пагинация всегда прижата к низу блока */}
      <div className="mt-4 flex justify-center">
        <Pagination
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageParam={pageParam}
        />
      </div>
      {/* Модалка редактирования категории */}
      {categoryToEdit && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          category={{ ...categoryToEdit, budgetId }}
          onSave={handleSaveCategory}
          onDelete={handleDeleteCategory}
        />
      )}
    </div>
  );
}
