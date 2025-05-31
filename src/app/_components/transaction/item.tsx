import React from 'react';

interface TransactionItemProps {
  transaction: {
    id: string;
    date: Date; 
    description: string | null;
    category: { id: string; name: string };
    amount: number;
    type: "INCOME" | "EXPENSE";
  };
  onClick: (id: string | null) => void;
};

export function TransactionItem ({ transaction, onClick }: TransactionItemProps) {
  const isIncome = transaction.type === "INCOME";

  const formattedDate = transaction.date.toLocaleDateString("ru-RU");
  const formattedAmount = `${isIncome ? "+" : "-"}₽${transaction.amount.toFixed(2)}`;  // 2 знака после запятой
  return (
    <div
      className="container mx-auto w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 cursor-pointer border-b"
      onClick={() => onClick(transaction.id)}>
      <div className="flex flex-col text-left">
        <span className="text-sm text-gray-500">{formattedDate}</span>
        <span className="text-lg font-medium text-gray-800">{transaction.description || "Без описания"}</span>
      </div>
      <div className="flex flex-col items-end text-right">
        <span className={`text-base font-semibold ${isIncome ? "text-purple-600" : "text-pink-600"}`}>
          {formattedAmount}
        </span>
        <span className="text-xs text-gray-500">{transaction.category?.name}</span>
      </div>
    </div>
  );
};
