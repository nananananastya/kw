"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Определяем тип для данных
interface IncomeExpenseData {
  date: string;
  income: number;
  expense: number;
}

// Указываем, что пропс data должен быть массивом объектов типа IncomeExpenseData
interface IncomeExpenseChartProps {
  data: IncomeExpenseData[]; // Убедитесь, что передаете массив объектов с нужными полями
}

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>Нет данных для линейного графика.</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-700" >Динамика доходов и расходов</h2>
      <ResponsiveContainer width="95%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
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
};

export default IncomeExpenseChart;
