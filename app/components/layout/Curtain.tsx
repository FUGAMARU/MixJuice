"use client"

import { AppShell, Box } from "@mantine/core"
import { useState, useEffect } from "react"
import { useRecoilValue } from "recoil"
import NowLoading from "../templates/NowLoading"
import LayoutHeader from "./LayoutHeader"
import LayoutNavbar from "./LayoutNavbar"
import { loadingAtom } from "@/app/atoms/loadingAtom"

type Props = {
  children: React.ReactNode
}

const Curtain: React.FC<Props> = ({ children }) => {
  const isLoading = useRecoilValue(loadingAtom)
  const [className, setClassName] = useState("")

  useEffect(() => {
    ;(async () => {
      if (!isLoading) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setClassName("animate__animated animate__fadeOut")
      }
    })()
  }, [isLoading])

  return (
    <>
      <Box
        className={className}
        w="100%"
        h="100%"
        pos="absolute"
        top={0}
        left={0}
        sx={{
          zIndex: 1000,
          backdropFilter: "blur(30px)"
        }}
      >
        <NowLoading />
      </Box>

      <AppShell
        header={<LayoutHeader />}
        navbar={<LayoutNavbar />}
        navbarOffsetBreakpoint="sm"
        styles={{
          main: {
            height: "100vh",
            margin: "-1rem -1rem auto -1rem"
          }
        }}
      >
        {children}
      </AppShell>
    </>
  )
}

export default Curtain
