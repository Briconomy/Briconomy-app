import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      borderTop: '1px solid #e9ecef',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Items info */}
      <div style={{
        fontSize: '14px',
        color: '#6c757d'
      }}>
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> items
      </div>

      {/* Pagination controls */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Items per page selector */}
        {onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            style={{
              padding: '6px 10px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        )}

        {/* First page button */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            background: currentPage === 1 ? '#e9ecef' : '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: currentPage === 1 ? 0.6 : 1
          }}
          title="First page"
        >
          ««
        </button>

        {/* Previous page button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            background: currentPage === 1 ? '#e9ecef' : '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: currentPage === 1 ? 0.6 : 1
          }}
          title="Previous page"
        >
          «
        </button>

        {/* Page numbers */}
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  color: '#6c757d'
                }}
              >
                ...
              </span>
            );
          }

          return (
            <button
              type="button"
              key={page}
              onClick={() => onPageChange(page as number)}
              style={{
                padding: '6px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                background: currentPage === page ? '#162F1B' : '#fff',
                color: currentPage === page ? '#fff' : '#495057',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: currentPage === page ? '600' : '500',
                minWidth: '40px'
              }}
            >
              {page}
            </button>
          );
        })}

        {/* Next page button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            background: currentPage === totalPages ? '#e9ecef' : '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: currentPage === totalPages ? 0.6 : 1
          }}
          title="Next page"
        >
          »
        </button>

        {/* Last page button */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            background: currentPage === totalPages ? '#e9ecef' : '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: currentPage === totalPages ? 0.6 : 1
          }}
          title="Last page"
        >
          »»
        </button>
      </div>
    </div>
  );
};

export default Pagination;
