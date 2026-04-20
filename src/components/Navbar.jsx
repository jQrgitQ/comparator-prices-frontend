import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { SearchBar } from './ui';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/products', label: 'Products' },
    { path: '/stores', label: 'Stores' },
    { path: '/categories', label: 'Categories' },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/dashboard" className={styles.logo}>
          <svg viewBox="0 0 32 32" className={styles.logoIcon}>
            <rect width="32" height="32" rx="8" fill="#6366f1"/>
            <path d="M8 16h6v6H8zM18 10h6v12h-6z" fill="white"/>
          </svg>
          <span className={styles.logoText}>PriceCompare</span>
        </Link>

        <div className={styles.searchWrapper}>
          <SearchBar 
            placeholder="Search products..." 
            onSearch={handleSearch}
            initialValue={searchQuery}
          />
        </div>

        <div className={styles.navLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.userSection}>
          <div className={styles.avatar}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;