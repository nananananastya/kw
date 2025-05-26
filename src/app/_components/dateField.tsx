'use client'

import { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';

interface DateFieldProps {
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  className?: string;
  maxDate?: Date; 
  disabled?: boolean; 
}

export const DateField = ({ value, onChange, error, className = '', maxDate, disabled = false }: DateFieldProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);

  const handleChange = useCallback((date: Date | null) => {
    setSelectedDate(date);   // обновляем локальное состояние
    if (date) {
      onChange(date);   // уведомляем родителя, если дата выбрана
    }
  }, [onChange]);

  return (
    <div className="relative">
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        className={className}
        maxDate={maxDate}
        disabled={disabled}  
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
