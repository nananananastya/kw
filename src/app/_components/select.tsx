// src/components/Select.tsx
interface SelectProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { label: string; value: string }[]; // Массив объектов с полями label и value
    id: string;
    error?: string; // Сообщение об ошибке (если есть)
    disabled?: boolean; // Добавляем пропс disabled
}

export const Select = ({ value, onChange, options, id, error, disabled }: SelectProps) => {
    return (
        <div className="relative">
            <select
                id={id}
                className={`mt-1 block w-full rounded-md border-2 p-3 transition-all duration-300 ease-in-out`}
                value={value}
                onChange={onChange}
                disabled={disabled} 
            >
                <option value="" disabled hidden>Выберите</option> 
                {options.map((option, index) => (
                    <option key={index} value={option.value}>{option.label}</option>
                ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};
