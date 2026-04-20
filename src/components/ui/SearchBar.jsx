import { useState } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ({ 
  placeholder = 'Search...', 
  onSearch,
  initialValue = '',
  className = ''
}) => {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(value);
  };

  const handleClear = () => {
    setValue('');
    onSearch?.('');
  };

  return (
    <form className={`${styles.searchBar} ${className}`} onSubmit={handleSubmit}>
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button type="button" className={styles.clearBtn} onClick={handleClear}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
    </form>
  );
};

export default SearchBar;