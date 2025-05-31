import React from 'react'; 

interface InputProps {
  type: string;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;  
}

export function Input ({ type, value, onChange, placeholder, readOnly = false }: InputProps) {
  return (
    <div className="relative">
      <input
        type={type}
        className={`mt-1 block w-full rounded-md border-2 p-3 transition-all duration-300 ease-in-out
          focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}  
      />
    </div>
  );
};
