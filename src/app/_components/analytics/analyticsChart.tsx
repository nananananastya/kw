'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartButton from './chartButton';

interface AnalyticsChartProps {
  categoryData: { category: string; value: number }[];
}

export default function AnalyticsChart({ categoryData }: AnalyticsChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie'); // тип выбранного графика

  const COLORS = [
    '#D84C9B', '#9B47B1', '#DA6DFF', '#8E2CB7', '#F06DA6',
    '#B25BCC', '#F4A6D7', '#BB66D4', '#E8A0FF', '#9A3E9C',
  ];

  function handleChartTypeChange(type: 'pie' | 'bar') { // обработчик смены типа графика
    setChartType(type);
  }

  return (
    <div className="h-80">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-700">Распределение расходов по категориям</h2>
        <div className="flex gap-4 justify-end">
          <ChartButton
            type="pie"
            isActive={chartType === 'pie'}
            onClick={() => handleChartTypeChange('pie')}
            text="Круговая"
          />
          <ChartButton
            type="bar"
            isActive={chartType === 'bar'}
            onClick={() => handleChartTypeChange('bar')}
            text="Столбчатая"
          />
        </div>
      </div>

      {chartType === 'pie' ? (
        // адаптивная ширина и высота (заполняет див)
        <ResponsiveContainer width="100%" height="100%"> 
        {/*  контейнер для круговой. */}
          <PieChart> 
            <Pie data={categoryData} dataKey="value" nameKey="category" outerRadius={100} label>
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> // отдельный сегмент с цветом.
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="horizontal" align="center" verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryData}>
            <defs>
              {/* создаем градиент для столбцов */}
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F06DA6" stopOpacity={1} /> 
                <stop offset="100%" stopColor="#9B47B1" stopOpacity={1} /> 
              </linearGradient>
            </defs>
            {/* оси графика */}
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            
            <Bar dataKey="value" fill="url(#gradient1)" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}