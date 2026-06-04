import { useState } from "react";

function SearchBar({ placeholder, onSearch, value: externalValue, onChange: externalOnChange }) {
  const [internalQuery, setInternalQuery] = useState("");

  const query = externalValue !== undefined ? externalValue : internalQuery;
  
  const setQuery = (value) => {
    if (externalOnChange) {
      externalOnChange(value);
    } else {
      setInternalQuery(value);
    }
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
      {query && (
        <button type="button" className="clear-btn" onClick={handleClear}>
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;