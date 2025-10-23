import { useState, type ChangeEvent } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  value: string;
  options: FilterOption[];
}

interface SearchFilterProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  filters?: FilterConfig[];
  onFilterChange?: (key: string, value: string) => void;
}

function SearchFilter({ placeholder, onSearch, filters, onFilterChange }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch?.(value);
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
      
      {filters && onFilterChange && (
        <div className="filter-options">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(event) => onFilterChange(filter.key, event.target.value)}
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