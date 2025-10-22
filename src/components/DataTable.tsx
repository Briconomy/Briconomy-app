import type { ReactNode } from 'react';

interface DataTableColumn<T> {
  key: keyof T & string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Array<DataTableColumn<T>>;
  actions?: ReactNode;
  onRowClick?: (row: T) => void;
}

function DataTable<T>({ title, data, columns, actions, onRowClick }: DataTableProps<T>) {
  return (
    <div className="data-table">
      <div className="table-header">
        <div className="table-title">{title}</div>
        {actions && (
          <div className="table-actions">
            {actions}
          </div>
        )}
      </div>
      
      <div className="table-content">
        {data.length === 0 ? (
          <div className="empty-state">
            <p>No data available</p>
          </div>
        ) : (
          data.map((row, index) => {
            const handleRowClick = () => {
              if (onRowClick) onRowClick(row);
            };

            return (
              <div
                key={String(index)}
                className="table-row"
                onClick={handleRowClick}
              >
                {columns.map((column) => {
                  const cellValue = row[column.key];
                  return (
                    <div key={column.key} className="table-cell">
                      {column.render ? column.render(cellValue, row) : cellValue as ReactNode}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default DataTable;