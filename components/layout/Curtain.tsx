"use client"

import { Box } from "@mantine/core"
import { useFavicon } from "@mantine/hooks"
import { usePathname } from "next/navigation"
import { useState, useEffect, memo, useMemo } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
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
import useStorage from "@/hooks/useStorage"
import { Children } from "@/types/Children"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

const Curtain = ({ children }: Children) => {
  useInitializer()

  const pathname = usePathname()
  const { breakPoint } = useBreakPoints()
  const [userInfo, isLoadingUserInfo] = useAuthState(auth)
  const { userData } = useStorage({ initialize: false })

  const screenHeightWithoutHeader = useMemo(
    () => `calc(100vh - ${STYLING_VALUES.HEADER_HEIGHT}px)`,
    []
  )
  const isConnectPage = useMemo(() => pathname === "/connect", [pathname])
  const isSigninPage = useMemo(() => pathname === "/signin", [pathname])

  const isLoading = useRecoilValue(loadingAtom)
  const [className, setClassName] = useState("")
  const [isDisplayLoadingScreen, setIsDisplayLoadingScreen] = useState(true)

  const faviconIndex = useRecoilValue(faviconIndexAtom)

  useEffect(() => {
    ;(async () => {
      /**
       * サインインページ以外において
       * ①ユーザーの認証情報が読み込み中である
       * ②ユーザー登録が完了していない
       * ③ユーザーデーターをFirestoreから引っ張ってくる作業が完了していない
       * のいずれかに該当する場合はローディング画面を表示したままにする
       */
      if (
        !isSigninPage &&
        (isLoadingUserInfo || !isDefined(userInfo) || !isDefined(userData))
      )
        return

      if (!isLoading.state) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setClassName("animate__animated animate__fadeOut")

        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsDisplayLoadingScreen(false)
        return
      }

      if (isLoading.state && isLoading.stateChangedOn !== "initial") {
        setIsDisplayLoadingScreen(true)
        setClassName("animate__animated animate__fadeIn")
      }
    })()
  }, [isLoading, userInfo, userData, isLoadingUserInfo, isSigninPage])

  useFavicon(faviconIndex ? `/header-logos/logo-${faviconIndex}.png` : "")

  return (
    <>
      <Box
        className={className}
        display={isDisplayLoadingScreen ? "block" : "none"}
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
