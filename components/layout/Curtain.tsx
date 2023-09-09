"use client"

import { Box } from "@mantine/core"
import { useFavicon } from "@mantine/hooks"
import { usePathname } from "next/navigation"
import { useState, useEffect, memo, useMemo } from "react"
import { useRecoilValue } from "recoil"
import ErrorModal from "./ErrorModal"
import LayoutHeader from "./LayoutHeader"
import NowLoading from "./NowLoading"
import { loadingAtom } from "@/atoms/loadingAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { HEADER_HEIGHT } from "@/constants/Styling"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useSpotifyApi from "@/hooks/useSpotifyApi"
import useSpotifyToken from "@/hooks/useSpotifyToken"
import { generateRandomNumber } from "@/utils/randomNumberGenerator"

type Props = {
  children: React.ReactNode
}

const Curtain = ({ children }: Props) => {
  const pathname = usePathname()

  const screenHeightWithoutHeader = useMemo(
    () => `calc(100vh - ${HEADER_HEIGHT}px)`,
    []
  )
  const isConnectPage = useMemo(() => pathname === "/connect", [pathname])

  const isLoading = useRecoilValue(loadingAtom)
  const [className, setClassName] = useState("")
  const [isDisplay, setIsDisplay] = useState(true)

  useEffect(() => {
    ;(async () => {
      if (!isLoading) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setClassName("animate__animated animate__fadeOut")

        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsDisplay(false)
      }
    })()
  }, [isLoading])

  const [faviconSrc, setFaviconSrc] = useState("")
  useFavicon(faviconSrc)
  useEffect(() => {
    setFaviconSrc(`/header-logos/logo-${generateRandomNumber(1, 12)}.png`)
  }, [])

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

      <LayoutHeader />

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
