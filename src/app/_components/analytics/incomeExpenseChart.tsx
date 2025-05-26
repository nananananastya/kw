'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IncomeExpenseProps {
  data: {
    date: string;
    income: number;
    expense: number;
  }[];
}

export default function IncomeExpenseChart ({ data }: IncomeExpenseProps) {
  if (!data || data.length === 0) {
    return <div>Нет данных для линейного графика.</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-700">
        Динамика доходов и расходов
      </h2>
      {/* Делает график адаптивным */}
      <ResponsiveContainer width="95%" height={400}> 
        {/* контейнер самого графика */}
        <LineChart data={data}>
          {/* сетка на заднем фоне */}
          <CartesianGrid strokeDasharray="3 3" /> 
          {/* оси */}
          <XAxis dataKey="date" /> 
          <YAxis />
          {/* подсказдка */}
          <Tooltip />
          {/* Легенда */}
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#b248fd"
            name="Доходы"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#ec3ca9"
            name="Расходы"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}