import { useViewportSize } from "@mantine/hooks"
import { useCallback, useMemo } from "react"

const useBreakPoints = () => {
  const { width: vw } = useViewportSize()

  const breakPoint = useMemo(() => {
    if (vw === 0) return undefined
    if (vw <= 599) return "SmartPhone"
    if (vw <= 1024) return "Tablet"

    return "PC" // 横幅が1025px以上
  }, [vw])

  const setRespVal = useCallback(
    (val1: string, val2: string, val3: string) => {
      if (breakPoint === "SmartPhone") return val1
      if (breakPoint === "Tablet") return val2
      return val3
    },
    [breakPoint]
  )

  return { breakPoint, setRespVal } as const
}

export default useBreakPoints
