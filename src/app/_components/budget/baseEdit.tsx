import { Button } from "../button";
import { GoX, GoTrash } from "react-icons/go"; // Импортируем иконки крестика и корзины

interface EditModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  onDelete?: () => void; // Сделано необязательным
  disableDelete?: boolean; // Новый параметр для контроля доступности кнопки удаления
}

export const EditModalWrapper = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  children,
  rightAction,
  onDelete,
  disableDelete = false, // по умолчанию кнопка не отключена
}: EditModalWrapperProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
          {onDelete && !disableDelete && ( // если onDelete есть и delete не отключен
            <button
              onClick={onDelete}
              className="absolute right-12 text-pink-500 hover:text-red-700"
              title="Удалить"
            >
              <GoTrash size={24} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900"
            title="Закрыть"
          >
            <GoX size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          {children}
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
