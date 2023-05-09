import Image from "next/image"
import styles from "@/styles/LoadingAnimation.module.css"

const LoadingAnimation: React.FC = () => {
  return (
    <div className={styles.container}>
      <Image
        src="/loading.svg"
        width={177}
        height={40}
        alt="loading animation"
      />
      <p>Now Loading!!!!</p>
    </div>
  )
}

export default LoadingAnimation
