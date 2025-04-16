import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const currentDate = format(new Date(), 'dd MMMM yyyy', { locale: ru });

  return (
    <div className="container mx-auto bg-white shadow-lg rounded-xl p-6 flex flex-col md:flex-row items-center justify-between mb-4 ">
      {/* Левая часть — текст */}
      <div className="md:w-2/3 w-full">
        <h1 className="text-3xl font-semibold text-gray-700 mb-2">
          {title}
        </h1>
        <p className="text-lg text-gray-600">
          Сегодня: <span className="font-medium text-indigo-600">{currentDate}</span>
        </p>
        <div className="mt-4 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
      </div>

      {/* Правая часть — изображение */}
      <div className="md:w-1/3 w-full flex justify-end mt-6 md:mt-0">
        <img src="1.png" alt="Иллюстрация" className="h-32 w-auto object-contain" />
      </div>
    </div>
  );
};
