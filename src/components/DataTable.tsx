import React from 'react';

function DataTable({ title, data, columns, actions, onRowClick }) {
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
          data.map((row, index) => (
            <div 
              key={row.id || index} 
              className="table-row"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column) => (
                <div key={column.key} className="table-cell" data-label={column.label}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DataTable;