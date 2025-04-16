import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({ children, className = '', ...props }: ButtonProps) => {
  return (
    <button
      type={props.type || 'button'}
      className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l text-white font-medium py-2 px-14 rounded focus:outline-none focus:shadow-outline transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
