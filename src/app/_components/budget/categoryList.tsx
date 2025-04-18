import React, { useState } from 'react';
import { api } from '~/trpc/react';
import { Category } from '@prisma/client';
import ItemList from './itemList';
import { GoPlus } from 'react-icons/go';
import EditCategoryModal from './editCategory'; // Импортируем модалку для редактирования

type CategoryListProps = {
  budgetId: string;
  setAddCategoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CategoryList: React.FC<CategoryListProps> = ({ budgetId, setAddCategoryModalOpen }) => {
  const { data: categories = [], isLoading, error } = api.budget.getCategoriesForBudget.useQuery(budgetId);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Состояние для открытия модалки редактирования
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null); // Данные категории для редактирования

  const utils = api.useUtils();

  const deleteCategory = api.budget.deleteCategory.useMutation({
    onSuccess: () => {
      utils.budget.getCategoriesForBudget.invalidate(budgetId); // обновим список
      setIsEditModalOpen(false); // закроем модалку
    },
  });

  if (isLoading) return <div>Загрузка категорий...</div>;
  if (error) {
    console.error("Ошибка при загрузке категорий:", error);
    return <div>Ошибка при загрузке категорий. Попробуйте позже.</div>;
  }

  const handleCategoryClick = (category: Category) => {
    setCategoryToEdit(category); // Устанавливаем выбранную категорию
    setIsEditModalOpen(true); // Открываем модалку для редактирования
  };

  const handleSaveCategory = (id: string, name: string, limit: number) => {
    // Добавьте логику для сохранения измененной категории (например, через API)
    console.log("Сохранение изменений для категории:", id, name, limit);
    // Не забудьте обновить кэш и перезапросить данные
    setIsEditModalOpen(false); // Закрытие модалки
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Точно удалить категорию?")) {
      deleteCategory.mutate({id});
    }
  };
  

  return (
    <div className="mt-6">
      <ItemList<Category>
        items={categories}
        keyExtractor={(category) => category.id}
        title={
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Категории бюджета</h2>
            <button
              onClick={() => setAddCategoryModalOpen(true)} // Открытие модалки для добавления категории
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              title="Добавить категорию"
            >
              <GoPlus className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        }
        renderItem={(category) => (
          <div
            className="flex items-center justify-between py-2 border-b border-gray-200 cursor-pointer"
            onClick={() => handleCategoryClick(category)}
          >
            <div>
              <p className="text-gray-700">{category.name}</p>
              <p className="text-sm text-gray-500">
                Потрачено: ₽{1000}
              </p>
            </div>
            <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500"
                style={{
                  width: `30%`,
                }}
              />
            </div>
          </div>
        )}
      />
      
      {/* Модальное окно для редактирования категории */}
      {categoryToEdit && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          category={categoryToEdit}
          onSave={handleSaveCategory}
          onDelete={handleDeleteCategory} // 👈 ЭТОГО НЕ ХВАТАЛО
        />
      )}
    </div>
  );
};

export default CategoryList;
