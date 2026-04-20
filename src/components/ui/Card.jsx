import styles from './Card.module.css';

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick 
}) => {
  const classNames = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    hover && styles.hoverable,
    onClick && styles.clickable,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;