'use client';

import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { generatePagination } from '../../lib/utils';

export default function Pagination({
  totalPages,
  onPageChange,
  pageParam,
  currentPage: externalPage,
}: {
  totalPages: number;
  onPageChange: (page: number) => void;
  pageParam?: string; // если есть — читаем из URL
  currentPage?: number; // если pageParam нет — читаем напрямую
}) {

  const searchParams = useSearchParams();
  const currentPage = pageParam   // из URL берет текущую страницу
    ? Number(searchParams.get(pageParam)) || 1
    : externalPage || 1;

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <div className="inline-flex">
      <PaginationArrow
        direction="left"
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      <div className="flex -space-x-px">
        {allPages.map((page, index) => {
          let position: 'first' | 'last' | 'single' | 'middle' | undefined;

          if (index === 0) position = 'first';
          if (index === allPages.length - 1) position = 'last';
          if (allPages.length === 1) position = 'single';
          if (page === '...') position = 'middle';

          return (
            <PaginationNumber
              key={page}
              page={page}
              position={position}
              isActive={currentPage === page}
              onClick={onPageChange}
            />
          );
        })}
      </div>

      <PaginationArrow
        direction="right"
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </div>
  );
}

function PaginationNumber({
  page,
  isActive,
  position,
  onClick,
}: {
  page: number | string;
  position?: 'first' | 'last' | 'middle' | 'single';
  isActive: boolean;
  onClick: (page: number) => void;
}) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center text-sm border',
    {
      'rounded-l-md': position === 'first' || position === 'single',
      'rounded-r-md': position === 'last' || position === 'single',
      'z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white': isActive,
      'hover:bg-gray-100': !isActive && position !== 'middle',
      'text-gray-300': position === 'middle',
      'cursor-pointer': position !== 'middle',
    },
  );

  return position === 'middle' ? (
    <div className={className}>{page}</div>
  ) : (
    <div className={className} onClick={() => onClick(Number(page))}>
      {page}
    </div>
  );
}

function PaginationArrow({
  direction,
  isDisabled,
  onClick,
}: {
  direction: 'left' | 'right';
  isDisabled?: boolean;
  onClick: () => void;
}) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center rounded-md border',
    {
      'pointer-events-none text-gray-300': isDisabled,
      'hover:bg-gray-100': !isDisabled,
      'mr-2 md:mr-4': direction === 'left',
      'ml-2 md:ml-4': direction === 'right',
      'cursor-pointer': !isDisabled,
    },
  );

  const icon =
    direction === 'left' ? (
      <ArrowLeftIcon className="w-4" />
    ) : (
      <ArrowRightIcon className="w-4" />
    );

  return <div className={className} onClick={!isDisabled ? onClick : undefined}>{icon}</div>;
}
