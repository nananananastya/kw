'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaPlus, FaChartPie, FaCalendarAlt } from 'react-icons/fa';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  route: string;
}

const actions: QuickAction[] = [
  {
    icon: <FaPlus className="text-2xl text-white" />,
    label: 'Добавить транзакцию',
    route: '/transaction',
  },
  {
    icon: <FaCalendarAlt className="text-2xl text-white" />,
    label: 'Создать бюджет',
    route: '/budget',
  },
  {
    icon: <FaChartPie className="text-2xl text-white" />,
    label: 'Перейти к аналитике',
    route: '/analytics',
  },
];

export default function QuickActionsHero() {
  const router = useRouter();  // для перехода на др страницу

  return (
    <div className="bg-white flex flex-col rounded-2xl justify-center items-center p-6">
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {actions.map((action, idx) => (
            <motion.button
              key={idx}
              onClick={() => router.push(action.route)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-purple-600 text-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center transition-transform h-40 hover:shadow-2xl w-full"
            >
              <div className="mb-4">{action.icon}</div>
              <span className="text-md font-semibold">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};