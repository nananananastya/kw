// src/components/Select.tsx
interface SelectProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[]; // массив опций, который будет передаваться в компонент
    id: string; // уникальный id для каждого select
    error?: string; // сообщение об ошибке
}

export const Select = ({ label, value, onChange, options, id, error }: SelectProps) => {
    return (
        <div className="relative">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                id={id}
                className={`mt-1 block w-full rounded-md border-2 p-3 transition-all duration-300 ease-in-out 
                    ${error ? 'border-red-500' : 'border-gray-300'} 
                    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm`}
                value={value}
                onChange={onChange}
            >
                <option value="">Выберите {label.toLowerCase()}</option>
                {options.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};
