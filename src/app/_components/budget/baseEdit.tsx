import { Button } from "../button";
import { GoX } from "react-icons/go"; // Импортируем иконку крестика

interface EditModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const EditModalWrapper = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  children,
  rightAction,
}: EditModalWrapperProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
          title="Закрыть"
        >
          <GoX size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
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
