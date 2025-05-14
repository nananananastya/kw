import React from 'react'; 

interface InputProps {
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;  
  disabled?: boolean;  
}

export function Input ({ type, value, onChange, placeholder, error, readOnly = false, disabled = false }: InputProps) {
  return (
    <div className="relative">
      <input
        type={type}
        className={`mt-1 block w-full rounded-md border-2 p-3 transition-all duration-300 ease-in-out 
          ${error ? 'border-red-500' : 'border-gray-300'} 
          focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly} 
        disabled={disabled}  
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
