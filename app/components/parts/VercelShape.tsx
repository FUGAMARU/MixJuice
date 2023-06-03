import styles from "@/styles/VercelShape.module.css"

const VercelShape: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.shape1} />
      <div className={styles.shape2} />
    </div>
  )
}

export default VercelShape