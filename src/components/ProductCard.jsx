import { Link } from 'react-router-dom';
import { Card, Badge } from './ui';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, store, onDelete }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Card hover className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.name}>{product.name}</h3>
        
        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}
        
        {store && (
          <div className={styles.store}>
            <Badge variant="primary" size="sm">{store.name}</Badge>
          </div>
        )}
        
        <div className={styles.price}>
          {product.last_price ? (
            <span className={styles.priceValue}>
              {formatPrice(product.last_price)}
            </span>
          ) : (
            <span className={styles.noPrice}>No price</span>
          )}
        </div>
      </div>
      
      <div className={styles.actions}>
        <Link to={`/products/${product.id}`} className={styles.viewBtn}>
          View Details
        </Link>
        {onDelete && (
          <button onClick={() => onDelete(product.id)} className={styles.deleteBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;