"use client"

import { AppShell, Box } from "@mantine/core"
import { useFavicon } from "@mantine/hooks"
import { usePathname } from "next/navigation"
import { useState, useEffect, memo, useMemo } from "react"
import { useRecoilValue } from "recoil"
import ErrorModal from "./ErrorModal"
import LayoutHeader from "./LayoutHeader"
import LayoutNavbar from "./LayoutNavbar"
import NowLoading from "./NowLoading"
import { loadingAtom } from "@/atoms/loadingAtom"
import { NAVBAR_PADDING } from "@/constants/Styling"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useSpotifyApi from "@/hooks/useSpotifyApi"
import useWebDAVApi from "@/hooks/useWebDAVApi"
import { generateRandomNumber } from "@/utils/randomNumberGenerator"

type Props = {
  children: React.ReactNode
}

const Curtain = ({ children }: Props) => {
  const pathname = usePathname()
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
  useWebDAVApi({ initialize: true })

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

      <AppShell
        header={<LayoutHeader />}
        navbar={isConnectPage ? <></> : <LayoutNavbar />}
        navbarOffsetBreakpoint="sm"
        styles={{
          main: {
            minHeight: `calc(100dvh + ${NAVBAR_PADDING}px)`,
            margin: "-1rem -1rem 0" // この1remはMantineによって自動的に設定されるAppShellのpaddingを打ち消すため
          }
        }}
      >
        {children}
      </AppShell>

      <ErrorModal />
    </>
  )
}

export default memo(Curtain)
