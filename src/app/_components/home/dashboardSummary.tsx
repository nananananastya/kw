'use client';

import { api } from '~/trpc/react';
import { FaWallet, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface CardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const Card = ({ title, value, icon }: CardProps ) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-center gap-4 p-5 rounded-2xl border border-gray-300 bg-white shadow-sm">
    <div className="text-gray-700 text-2xl">{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-gray-900 text-xl font-semibold">{value.toLocaleString()} ₽</p>
    </div>
  </motion.div>
);

export default function DashboardSummary() {
  const { data, isLoading } = api.budget.summary.useQuery();

  if (isLoading || !data) return <p>Загрузка...</p>;

  return (
    <div className="bg-white flex flex-col rounded-2xl justify-center items-center p-6 mb-4">
        <div className="w-full"> 
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <Card
                    title="Текущий баланс"
                    value={data.totalBalance}
                    icon={<FaWallet />}
                />
                <Card
                    title="Доходы за неделю"
                    value={data.totalIncome}
                    icon={<FaArrowUp />}
                />
                <Card
                    title="Расходы за неделю"
                    value={data.totalExpenses}
                    icon={<FaArrowDown />}
                />
            </div>
        </div>
    </div>
  );
}
