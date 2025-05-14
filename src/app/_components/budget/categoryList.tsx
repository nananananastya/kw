import React, { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import ItemList from './itemList';
import { GoPlus } from 'react-icons/go';
import EditCategoryModal from './editCategory';
import { toast } from 'react-hot-toast';

interface CategoryListProps {
  budgetId: string;
  setAddCategoryModalOpen: (open: boolean) => void;
  refetchCategories?: { current: () => void };
  isOwner: boolean;
}


export function CategoryList({ budgetId, setAddCategoryModalOpen, refetchCategories, isOwner }: CategoryListProps) {
  const { data: categories = [], isLoading, error, refetch } = api.category.getCategoriesWithExpenses.useQuery(budgetId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<{
    id: string;
    name: string;
    limit: number;
    spent: number;
  } | null>(null);

  const utils = api.useUtils();

  const updateCategory = api.category.updateCategory.useMutation({
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error);
      } else if (data?.message) {
        toast.success(data.message);
        utils.category.getCategoriesWithExpenses.invalidate(budgetId);
      }
    },
  });

  useEffect(() => {
    if (refetchCategories) {
      refetchCategories.current = refetch;
    }
  }, [refetch, refetchCategories]);

  const deleteCategory = api.category.deleteCategory.useMutation({
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error);
      } else if (data?.message) {
        toast.success(data.message);
        utils.category.getCategoriesWithExpenses.invalidate(budgetId);
        setIsEditModalOpen(false);
      }
    },
  });

  const handleOwnerAction = (isOwner: boolean, action: () => void, errorMessage: string) => {
    if (!isOwner) {
      toast.error(errorMessage);
      return;
    }
    action();
  };

  if (isLoading) return <div>Загрузка категорий...</div>;
  if (error) {
    console.error("Ошибка при загрузке категорий:", error);
    return <div>Ошибка при загрузке категорий. Попробуйте позже.</div>;
  }

  const handleCategoryClick = (category: { id: string; name: string; limit: number; spent: number }) => {
    handleOwnerAction(
      isOwner,
      () => {
        setCategoryToEdit(category);
        setIsEditModalOpen(true);
      },
      "Редактирование категорий доступно только владельцу бюджета"
    );
  };

  const handleSaveCategory = (id: string, name: string, limit: number) => {
    updateCategory.mutate({ id, name, limit });
    setIsEditModalOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    handleOwnerAction(
      isOwner,
      () => {
        if (confirm("Точно удалить категорию?")) {
          deleteCategory.mutate({ id });
        }
      },
      "Удаление категорий доступно только владельцу бюджета"
    );
  };

  return (
    <div className="mt-6">
      <ItemList
        items={categories}
        keyExtractor={(category) => category.id}
        title={
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Категории бюджета</h2>
            <button
              onClick={() => {
                handleOwnerAction(
                  isOwner,
                  () => setAddCategoryModalOpen(true),
                  "Добавлять категории может только владелец бюджета"
                );
              }}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              title="Добавить категорию"
            >
              <GoPlus className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        }
        renderItem={(category) => {
          const spent = category.spent;
          const progress = Math.min((spent / category.limit) * 100, 100);
          const isOverLimit = spent > category.limit;
          const progressColor = 'bg-pink-500';

          return (
            <div
              className="flex items-center justify-between py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleCategoryClick(category)}
            >
              <div>
                <p className="text-gray-700">{category.name}</p>
                <p className="text-sm text-gray-500">
                  Потрачено:{" "}
                  <span className={isOverLimit ? "text-red-500 font-medium" : ""}>
                    ₽{spent.toFixed(2)}
                  </span>{" "}
                  из ₽{category.limit.toFixed(2)}
                </p>
              </div>
              <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColor}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        }}
      />

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
