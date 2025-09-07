import React, { useState } from 'react';

function SearchFilter({ placeholder, onSearch, filters, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch && onSearch(value);
  };

  return (
    <div className="search-filter">
      <div className="search-input">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      {filters && (
        <div className="filter-options">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchFilter;