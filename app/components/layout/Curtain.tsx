"use client"

import { AppShell, Box } from "@mantine/core"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import ErrorModal from "./ErrorModal"
import LayoutHeader from "./LayoutHeader"
import LayoutNavbar from "./LayoutNavbar"
import NowLoading from "./NowLoading"
import { connectAtom } from "@/atoms/connectAtom"
import { loadingAtom } from "@/atoms/loadingAtom"
import { NAVBAR_PADDING } from "@/constants/Styling"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"

type Props = {
  children: React.ReactNode
}

const Curtain = ({ children }: Props) => {
  const pathname = usePathname()
  const [isConnectPage, setIsConnectPage] = useRecoilState(connectAtom)
  useEffect(() => {
    if (pathname === "/connect") setIsConnectPage(true)
  }, [pathname, setIsConnectPage])

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

export default Curtain
