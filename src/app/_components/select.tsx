import React from 'react';

interface SelectProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { label: string; value: string }[]; 
    id: string;
    disabled?: boolean; 
}

export function Select ({ value, onChange, options, id, disabled }: SelectProps) {
    return (
        <div className="relative">
            <select
                id={id}
                className={`mt-1 block w-full rounded-md border-2 p-3 transition-all duration-300 ease-in-out`}
                value={value}
                onChange={onChange}
                disabled={disabled} 
            >
                <option value="" disabled hidden>Выберите</option> // не может второй раз выбрать "Выберите"
                {options.map((option, index) => (
                    <option key={index} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};
