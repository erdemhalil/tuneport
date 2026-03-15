interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = "",
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Page info */}
      <div className="text-sm text-zinc-500">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          className="flex items-center space-x-2 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:ring-2 focus:ring-zinc-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-zinc-500">Page</span>
          <span className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm font-medium text-zinc-800">
            {currentPage} of {totalPages}
          </span>
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="flex items-center space-x-2 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:ring-2 focus:ring-zinc-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Next</span>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
