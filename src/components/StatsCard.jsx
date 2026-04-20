import { Card } from './ui';
import styles from './StatsCard.module.css';

const StatsCard = ({ title, value, icon, color = 'primary', trend }) => {
  const colorClasses = {
    primary: styles.primary,
    success: styles.success,
    warning: styles.warning,
    error: styles.error,
  };

  return (
    <Card className={`${styles.card} ${colorClasses[color]}`}>
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value}</span>
        {trend && (
          <span className={`${styles.trend} ${trend > 0 ? styles.up : styles.down}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;