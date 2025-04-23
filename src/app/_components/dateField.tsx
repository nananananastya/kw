import { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateFieldProps {
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  className?: string;
  maxDate?: Date; 
}

export const DateField = ({
  value,
  onChange,
  error,
  className = '',
  maxDate, 
}: DateFieldProps) => {
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
        className={className}
        maxDate={maxDate} // <- передаём в DatePicker
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
