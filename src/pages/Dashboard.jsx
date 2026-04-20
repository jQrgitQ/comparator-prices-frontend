import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getStores, getCategories, getSubcategories } from '../api/axiosConfig';
import StatsCard from '../components/StatsCard';
import { Card, Skeleton } from '../components/ui';
import styles from './Dashboard.module.css';

const getTotalCount = (response) => {
  if (!response) return 0;
  if (typeof response.total === 'number') return response.total;
  if (Array.isArray(response)) return response.length;
  if (Array.isArray(response.items)) return response.items.length;
  if (Array.isArray(response.data)) return response.data.length;
  return 0;
};

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, stores: 0, categories: 0, subcategories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, stores, categories, subcategories] = await Promise.all([
          getProducts(0, 10000),
          getStores(0, 10000),
          getCategories(0, 10000),
          getSubcategories(0, 10000),
        ]);
        setStats({
          products: getTotalCount(products),
          stores: getTotalCount(stores),
          categories: getTotalCount(categories),
          subcategories: getTotalCount(subcategories),
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Categories',
      value: stats.categories,
      color: 'primary',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      title: 'Subcategories',
      value: stats.subcategories,
      color: 'success',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          <line x1="9" y1="14" x2="15" y2="14"/>
        </svg>
      ),
    },
    {
      title: 'Products',
      value: stats.products,
      color: 'warning',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
    },
    {
      title: 'Stores',
      value: stats.stores,
      color: 'error',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { path: '/categories', label: 'Manage Categories', icon: '📁' },
    { path: '/stores', label: 'Manage Stores', icon: '🏪' },
    { path: '/products', label: 'Manage Products', icon: '📦' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back! Here's an overview of your data.</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className={styles.skeletonCard}>
              <Skeleton variant="rect" width="48px" height="48px" className={styles.skeletonIcon} />
              <div className={styles.skeletonContent}>
                <Skeleton width="80px" height="16px" />
                <Skeleton width="60px" height="32px" />
              </div>
            </Card>
          ))
        ) : (
          statCards.map((stat, index) => (
            <div key={stat.title} style={{ animationDelay: `${index * 100}ms` }} className={styles.statWrapper}>
              <StatsCard {...stat} />
            </div>
          ))
        )}
      </div>

      <div className={styles.grid}>
        <Card className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionButtons}>
            {quickLinks.map((link) => (
              <Link key={link.path} to={link.path} className={styles.actionBtn}>
                <span className={styles.actionIcon}>{link.icon}</span>
                <span className={styles.actionLabel}>{link.label}</span>
                <svg className={styles.actionArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            ))}
          </div>
        </Card>

        <Card className={styles.infoCard}>
          <h2 className={styles.sectionTitle}>Getting Started</h2>
          <ul className={styles.infoList}>
            <li>
              <span className={styles.infoIcon}>📊</span>
              View and analyze your product data
            </li>
            <li>
              <span className={styles.infoIcon}>🏷️</span>
              Organize products with categories
            </li>
            <li>
              <span className={styles.infoIcon}>💰</span>
              Compare prices across different stores
            </li>
            <li>
              <span className={styles.infoIcon}>📈</span>
              Track price history and trends
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;