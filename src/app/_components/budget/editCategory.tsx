import { Button } from "../button";
import { GoX, GoTrash } from "react-icons/go";
import { Category } from "@prisma/client";
import { useEffect, useState } from "react";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  onSave: (id: string, name: string, limit: number) => void;
  onDelete?: (id: string) => void;
}

const EditCategoryModal = ({
  isOpen,
  onClose,
  category,
  onSave,
  onDelete,
}: EditCategoryModalProps) => {
  const [name, setName] = useState(category.name);
  const [limit, setLimit] = useState(category.limit);

  useEffect(() => {
    setName(category.name);
    setLimit(category.limit);
  }, [category]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(category.id, name, limit);
  };

  const rightAction = onDelete ? (
    <button
      onClick={() => onDelete(category.id)}
      className="text-red-600 hover:text-red-800"
      title="Удалить категорию"
    >
      <GoTrash size={20} />
    </button>
  ) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96 relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {rightAction}
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900"
            title="Закрыть"
          >
            <GoX size={24} />
          </button>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-2">Редактировать категорию</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Название</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Лимит</label>
            <input
              type="number"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              required
            />
          </div>
          <div className="flex justify-center pt-4">
            <Button type="submit" className="w-full sm:w-auto">
              Сохранить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;
