import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import styles from "@/styles/VercelShape.module.css"

const VercelShape = () => {
  return (
    <div
      className={styles.container}
      style={{ zIndex: ZINDEX_NUMBERS.VERCEL_SHAPE }}
    >
      <div className={styles.shape1} />
      <div className={styles.shape2} />
    </div>
  )
}

export default VercelShape
