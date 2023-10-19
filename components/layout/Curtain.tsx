"use client"

import { Box } from "@mantine/core"
import { useFavicon } from "@mantine/hooks"
import { usePathname } from "next/navigation"
import { useState, useEffect, memo, useMemo } from "react"
import { useRecoilValue } from "recoil"
import ErrorModal from "./ErrorModal"
import LayoutHeader from "./LayoutHeader"
import NowLoading from "./NowLoading"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import { loadingAtom } from "@/atoms/loadingAtom"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import useInitializer from "@/hooks/useInitializer"
import { Children } from "@/types/Children"

const Curtain = ({ children }: Children) => {
  useInitializer()

  const pathname = usePathname()
  const { breakPoint } = useBreakPoints()

  const screenHeightWithoutHeader = useMemo(
    () => `calc(100vh - ${STYLING_VALUES.HEADER_HEIGHT}px)`,
    []
  )
  const isConnectPage = useMemo(() => pathname === "/connect", [pathname])
  const isSigninPage = useMemo(() => pathname === "/signin", [pathname])

  const isLoading = useRecoilValue(loadingAtom)
  const [className, setClassName] = useState("")
  const [isDisplay, setIsDisplay] = useState(true)

  const faviconIndex = useRecoilValue(faviconIndexAtom)

  useEffect(() => {
    ;(async () => {
      if (!isLoading.state) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setClassName("animate__animated animate__fadeOut")

        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsDisplay(false)
        return
      }

      if (isLoading.state && isLoading.stateChangedOn !== "initial") {
        setIsDisplay(true)
        setClassName("animate__animated animate__fadeIn")
      }
    })()
  }, [isLoading])

  useFavicon(faviconIndex ? `/header-logos/logo-${faviconIndex}.png` : "")

  return (
    <>
      <Box
        className={className}
        display={isDisplay ? "block" : "none"}
        w="100%"
        h="100%"
        pos="absolute"
        top={0}
        left={0}
        sx={{
          zIndex: ZINDEX_NUMBERS.NOW_LOADING,
          backdropFilter: "blur(30px)"
        }}
      >
        <NowLoading />
      </Box>

      <LayoutHeader shouldShowBurger={!isConnectPage && breakPoint !== "PC"} />

      {isConnectPage || isSigninPage ? (
        <Box h={screenHeightWithoutHeader}>{children}</Box>
      ) : (
        children
      )}

      <ErrorModal />
    </>
  )
}

export default memo(Curtain)
