import { useMediaQuery } from "@mantine/hooks"
import { useCallback, useMemo } from "react"

const useBreakPoints = () => {
  const bp1 = useMediaQuery("(max-width: 599px)")
  const bp2 = useMediaQuery("(max-width: 1024px)")
  const bp3 = useMediaQuery("(min-width: 1025px)")

  const breakPoint = useMemo(() => {
    if (bp1 && bp2) return "SmartPhone"

    if (bp2) return "Tablet"

    if (bp3) return "PC"

    return "SmartPhone"
  }, [bp1, bp2, bp3])

  const setRespVal = useCallback(
    (val1: string, val2: string, val3: string) => {
      if (breakPoint === "SmartPhone") return val1

      if (breakPoint === "Tablet") return val2

      if (breakPoint === "PC") return val3
    },
    [breakPoint]
  )

  return { breakPoint, setRespVal } as const
}

export default useBreakPoints
