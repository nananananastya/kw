import { useEffect, useState } from "react";
import { EditModalWrapper } from "./baseEdit"; // Подключаем новый EditModalWrapper
import { Category } from "@prisma/client";

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
    onClose(); // Закрываем модальное окно после сохранения
  };

  return (
    <EditModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать категорию"
      onSubmit={handleSubmit}
      onDelete={() => {
          onDelete?.(category.id);
          onClose(); // Закрываем модальное окно после удаления
      }}
    >
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
    </EditModalWrapper>
  );
};

export default EditCategoryModal;
