import React from 'react';

interface ItemListProps<T> {
    items: T[]; // массив элементов типа T, которые нужно отобразить
    renderItem: (item: T) => React.ReactNode; // функция, которая рендерит отдельный элемент в React-ноде
    title?: React.ReactNode; 
    keyExtractor: (item: T) => string; // функция для получения уникального ключа из элемента (для оптимизации React)
    className?: string; 
}

export default function ItemList <T extends {}>({ items, renderItem, title, keyExtractor, className }: ItemListProps<T>) {
    return (
        <div className={`container mx-auto border border-gray-300 bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 ${className || ''}`}>
            {title && <div className="mb-4">{title}</div>}
            {/* Перебираем элементы списка и рендерим каждый */}
            {items.map(item => (
                // Используем React.Fragment с ключом, чтобы не создавать лишних DOM-элементов
                <React.Fragment key={keyExtractor(item)}>
                    {renderItem(item)}  {/* Рендерим элемент через функцию из пропсов */}
                </React.Fragment>
            ))}
        </div>
    );
};