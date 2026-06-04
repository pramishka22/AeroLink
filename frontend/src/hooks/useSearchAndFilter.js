import { useState, useMemo } from "react";

export function useSearchAndFilter(items, searchFields, initialSearch = "") {
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [items, searchQuery, searchFields]);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  const hasActiveFilters = searchQuery.trim().length > 0;

  const clearFilters = () => {
    setSearchQuery("");
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    hasActiveFilters,
    clearFilters
  };
}

export default useSearchAndFilter;