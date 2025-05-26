'use client';

import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { Button } from '../button';
import { Input } from '../input';
import { GoX } from 'react-icons/go'; 
import React from 'react'; 

interface AddEntityModalProps {
  isOpen: boolean;  // открыта ли модалка 
  onClose: () => void; // функция закрытия модалки
  title: string;   // заголовок модалки 
  fields: {    // описание полей формы
    name: string; // имя поля 
    label: string; // подпись над полем
    type: 'text' | 'number' | 'date';
    placeholder?: string;  
  }[];
  onSubmit: (values: Record<string, string>) => void;  // обработчик отправки формы
}

export function AddEntityModal ({ isOpen, onClose, title, fields, onSubmit }: AddEntityModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});  // значение полей в форме

  // чтобы форма открывалась с пустыми полями
  useEffect(() => {
    if (isOpen) {
      const initialValues: Record<string, string> = {};
      fields.forEach(field => {
        initialValues[field.name] = '';
      });
      setValues(initialValues);
    }
  }, [isOpen, fields]);

  // записываем значение заполненного поля 
  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (fields.every(field => values[field.name]?.trim() !== '')) { // проверка на заполненность полей
      onSubmit(values);
      onClose();
    }
  };

  return (
    // relative z-50 чтобы модалка была выше родительского компонента
    <Dialog open={isOpen} onClose={onClose} className="relative z-50"> 
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
            title="Закрыть"
          >
            <GoX size={24} />
          </button>
          <Dialog.Title className="text-xl font-semibold text-gray-700 mb-2">{title}</Dialog.Title>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                <Input
                  type={field.type}
                  value={values[field.name] || ''}
                  placeholder={field.placeholder}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              </div>
            ))}
            <div className="flex justify-center space-x-2 pt-4">
              <Button type="button" onClick={handleSubmit} className="w-full sm:w-auto">
                Добавить
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
