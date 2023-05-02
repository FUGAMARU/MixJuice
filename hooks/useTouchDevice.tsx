import { useState, useEffect } from "react"

const useTouchDevice = () => {
  const [isTouchDevice, setTouchDevice] = useState(false)

  useEffect(() => {
    setTouchDevice("ontouchstart" in window)
  }, [])

  return {
    isTouchDevice
  } as const
}

export default useTouchDevice
