'use client'

import { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';

interface DateFieldProps {
  value: Date | null;
  onChange: (date: Date) => void;
  className?: string;
  maxDate?: Date; 
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
} 

export const DateField = ({ value, onChange, className = '', maxDate, onKeyDown }: DateFieldProps) => {
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
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
