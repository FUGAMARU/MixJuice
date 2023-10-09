"use client"

import { Box } from "@mantine/core"
import { useFavicon } from "@mantine/hooks"
import { usePathname } from "next/navigation"
import { useState, useEffect, memo, useMemo } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import ErrorModal from "./ErrorModal"
import LayoutHeader from "./LayoutHeader"
import NowLoading from "./NowLoading"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import { loadingAtom } from "@/atoms/loadingAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSpotifyApi from "@/hooks/useSpotifyApi"
import useSpotifyToken from "@/hooks/useSpotifyToken"
import { Children } from "@/types/Children"
import { generateRandomNumber } from "@/utils/randomNumberGenerator"

const Curtain = ({ children }: Children) => {
  const pathname = usePathname()
  const { breakPoint } = useBreakPoints()

  const screenHeightWithoutHeader = useMemo(
    () => `calc(100vh - ${STYLING_VALUES.HEADER_HEIGHT}px)`,
    []
  )
  const isConnectPage = useMemo(() => pathname === "/connect", [pathname])

  const isLoading = useRecoilValue(loadingAtom)
  const [className, setClassName] = useState("")
  const [isDisplay, setIsDisplay] = useState(true)

  const [faviconIndex, setFaviconIndex] = useRecoilState(faviconIndexAtom)

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
  useEffect(() => {
    setFaviconIndex(generateRandomNumber(1, 12))
  }, [setFaviconIndex])

  useSpotifyApi({ initialize: true })
  useSpotifyToken({ initialize: true })

  useEffect(() => {
    const localStorageDataFormatVersion = localStorage.getItem(
      LOCAL_STORAGE_KEYS.LOCAL_STORAGE_DATA_FORMAT_VERSION
    )

    if (!localStorageDataFormatVersion) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.LOCAL_STORAGE_DATA_FORMAT_VERSION,
        "1"
      )
    }
  }, [])

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

      {isConnectPage ? (
        <Box h={screenHeightWithoutHeader}>{children}</Box>
      ) : (
        children
      )}

      <ErrorModal />
    </>
  )
}

export default memo(Curtain)
