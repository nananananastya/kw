import { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateFieldProps {
  value: Date | null; // Заменяем тип с string на Date или null
  onChange: (date: Date) => void;
  error?: string;
  className?: string; // <- добавляем кастомные стили
}

export const DateField = ({ value, onChange, error, className = '' }: DateFieldProps) => {
  // Начальное значение для selectedDate, если value не передано, то null
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);

  const handleChange = useCallback((date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      onChange(date);
    }
  }, [onChange]);

  return (
    <div className="relative">
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        className={className} // <- передаём стили
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
