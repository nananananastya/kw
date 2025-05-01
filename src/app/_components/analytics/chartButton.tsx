import React from 'react';

interface ChartButtonProps {
  type: 'pie' | 'bar'; 
  isActive: boolean; 
  onClick: () => void; 
  text: string; 
}

const ChartButton: React.FC<ChartButtonProps> = ({ type, isActive, onClick, text }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium ${
        isActive
          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      }`}
    >
      {text}
    </button>
  );
};

export default ChartButton;
