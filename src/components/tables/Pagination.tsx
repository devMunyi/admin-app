"use client";

import Select from "../temp-ui/form/Select";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
};

const ROWS_PER_PAGE_OPTIONS = [7, 10, 50, 100];
const rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS.map((value) => ({
  label: value.toString(),
  value: value.toString(),
}));

const Pagination = ({
  currentPage,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: PaginationProps) => {
  // Calculate pages to show around current page
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, currentPage + 1);

    // Adjust if we're at the beginning or end
    if (currentPage <= 2) {
      end = 3;
    } else if (currentPage >= totalPages - 1) {
      start = totalPages - 2;
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 px-2 py-3">
      {/* Rows per page selector - left side */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="h-10 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          {ROWS_PER_PAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination controls - right side */}
      <div className="flex items-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="mr-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          Previous
        </button>
        <div className="flex items-center gap-2">
          {visiblePages[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${currentPage === 1
                  ? "bg-brand-500 text-white"
                  : "text-gray-700 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500"
                  }`}
              >
                1
              </button>
              {visiblePages[0] > 2 && <span className="px-2">...</span>}
            </>
          )}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${currentPage === page
                ? "bg-brand-500 text-white"
                : "text-gray-700 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500"
                }`}
            >
              {page}
            </button>
          ))}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="px-2">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${currentPage === totalPages
                  ? "bg-brand-500 text-white"
                  : "text-gray-700 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500"
                  }`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;