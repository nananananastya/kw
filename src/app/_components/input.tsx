interface InputProps {
    type: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
  }
  
  export const Input = ({ type, value, onChange, placeholder, error }: InputProps) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={`mt-1 block w-full rounded-md border-2 p-3 transition-all duration-300 ease-in-out 
            ${error ? 'border-red-500' : 'border-gray-300'} 
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm`}
          value={value}
          onChange={onChange}  // Здесь передается onChange
          placeholder={placeholder}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  };
  