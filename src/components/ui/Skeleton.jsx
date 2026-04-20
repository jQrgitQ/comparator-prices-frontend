import styles from './Skeleton.module.css';

const Skeleton = ({ 
  variant = 'text',
  width,
  height,
  className = ''
}) => {
  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div 
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;