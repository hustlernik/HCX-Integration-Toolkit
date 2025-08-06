import React from 'react';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  label?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  label = 'items',
}) => {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-gray-700">
        Showing {start} to {end} of {totalItems} {label}
      </div>
      <div className="flex gap-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalItems === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
