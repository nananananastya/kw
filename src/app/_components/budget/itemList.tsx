import React from 'react';

interface ItemListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    title?: React.ReactNode;  
    keyExtractor: (item: T) => string;
    className?: string; 
}

const ItemList = <T extends {}>({ items, renderItem, title, keyExtractor, className }: ItemListProps<T>) => {
    return (
        <div className={`container mx-auto border border-gray-300 bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 ${className || ''}`}>
            {title && <div className="mb-4">{title}</div>}
            {items.map((item) => (
                <React.Fragment key={keyExtractor(item)}>
                    {renderItem(item)}
                </React.Fragment>
            ))}
        </div>
    );
};

export default ItemList;
