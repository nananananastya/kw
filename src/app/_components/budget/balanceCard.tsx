import React, { useState } from "react";
import ReactCardFlip from "react-card-flip";
import { api } from '~/trpc/react';
import { toast } from 'react-hot-toast';

interface BalanceCardProps {
  balance: number;          // Текущий баланс бюджета
  expense: number;          // Потраченная сумма
  isFlipped: boolean;       // Показывает ли тыльную сторону
  setIsFlipped: (flipped: boolean) => void; // Функция для переворота карточки
  budgetId: string;         // ID бюджета, необходимый для API-запросов
}

export default function BalanceCard({ balance, expense, isFlipped, setIsFlipped, budgetId }: BalanceCardProps) {
  const [amount, setAmount] = useState<string>(''); // Введенная сумма
  const [isLoading, setIsLoading] = useState<boolean>(false); // Флаг загрузки (для updateBalance и decreaseBalance)

  const changeBalance = api.budget.changeBudgetBalance.useMutation()
  const utils = api.useUtils();

  const handleSubmit = (type: "add" | "subtract") => {
    if (isLoading || amount === '') return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsLoading(true);

    changeBalance.mutate({ budgetId, amount: parsedAmount, type },
      {
        onSuccess: (data) => {
          setIsLoading(false);

          if (data?.error) {
            toast.error(data.error);
            return;
          }
          setIsFlipped(false);
          setAmount('');
          
          if (data.message) {
            toast.success(data.message);
          }
          utils.budget.getBudgetSummary.invalidate({ budgetId });
        },
        onError: () => {
          setIsLoading(false);
          toast.error("Произошла ошибка при обновлении баланса");
        },
      }
    );
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();  // предотвращает переворот при клике на инпут
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    //  разрешаем только числа и десятичную точку (^ — начало строки \d* — любое количество цифр \.? — 0 или 1 точка\d* — ещё цифры $ — конец строки)
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
      {/* Front */}
      <div
        className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl shadow-xl flex flex-col justify-center items-center hover:scale-105 transition-transform transform ease-in-out h-52 font-sans"
        onClick={() => setIsFlipped(true)}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Баланс бюджета</h2>
        <p className="text-4xl font-semibold text-white">₽{balance.toFixed(2)}</p>

        <div className="w-full h-1 mt-4 bg-white/20 rounded-full">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${Math.min((expense / balance) * 100, 100)}%` }}
          />
        </div>

        <p className="text-sm text-white mt-2">
          Потрачено: ₽{expense.toFixed(2)}
        </p>
      </div>

      {/* Back */}
      <div
        className="relative bg-white p-6 rounded-xl shadow-xl flex flex-col justify-center items-center transition-transform  h-52 font-sans overflow-hidden cursor-pointer"
        onClick={() => setIsFlipped(false)}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200 rounded-full opacity-30 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200 rounded-full opacity-30 -translate-x-1/2 translate-y-1/2" />
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Изменить баланс</h2>
        <input
          type="text"
          placeholder="Введите сумму"
          className="mb-3 p-2 w-full rounded-md border border-gray-300 text-gray-800"
          value={amount}
          onChange={handleAmountChange}
          onClick={handleInputClick}
        />
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 bg-purple-500 text-white rounded ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => handleSubmit("add")}
            disabled={isLoading}
          >
            Пополнить
          </button>
          <button
            className={`px-4 py-2 bg-pink-500 text-white rounded ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => handleSubmit("subtract")}
            disabled={isLoading}
          >
            Снять
          </button>
        </div>
      </div>
    </ReactCardFlip>
  );
}