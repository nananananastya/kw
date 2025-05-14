import { useEffect, useState } from 'react';
import { EditModalWrapper } from './baseEdit';
import { DateField } from '../dateField';

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
  };
  onSave: (id: string, name: string, targetAmount: number, targetDate: Date) => void;
  onDelete: (id: string) => void;
}

export default function EditGoalModal ({ isOpen, onClose, goal, onSave, onDelete }: EditGoalModalProps) {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount);
  const [targetDate, setTargetDate] = useState(goal.targetDate);

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount);
      setTargetDate(goal.targetDate);
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(goal.id, name, targetAmount, targetDate);
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Вы уверены, что хотите удалить эту цель?")) {
      onDelete(goal.id);
      onClose(); 
    }
  };

  return (
    <EditModalWrapper 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Редактировать цель" 
      onSubmit={handleSubmit} 
      onDelete={handleDelete} 
    >
      <div className="mb-4">
        <label className="container mx-auto block text-sm font-medium text-gray-700">Название цели</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Целевая сумма</label>
        <input
          type="number"
          value={targetAmount}
          onChange={(e) => setTargetAmount(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Дата достижения</label>
        <DateField
          value={targetDate}
          onChange={(d) => {
            if (d instanceof Date && !isNaN(d.getTime())) {
              setTargetDate(d);
            }
          }}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
    </EditModalWrapper>
  );
};