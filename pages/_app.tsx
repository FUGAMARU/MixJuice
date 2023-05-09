import "@/styles/globals.css"
import { MantineProvider } from "@mantine/core"
import type { AppProps } from "next/app"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { RecoilRoot } from "recoil"
import CustomFonts from "@/components/CustomFonts"
import "animate.css"
import LoadingAnimation from "@/components/parts/LoadingAnimation"
import VercelShape from "@/components/parts/VercelShape"

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [isLoading, setLoading] = useState(true)

  /** "/"にアクセスが来た場合実体の/mainにバレないようにリダイレクトさせる */
  useEffect(() => {
    switch (router.pathname) {
      case "/":
        router.push({ pathname: "/main", query: { from: "internal" } }, "/")
        break
      case "/main":
        /** URL直打ちで/mainにアクセスされた場合はローディング画面のままになってしまうので一旦"/"にリダイレクトさせてから/mainにリダイレクトさせる */
        if (router.query.from !== "internal") {
          router.push("/")
        }
        break
    }
  }, [router])

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleStop = () => setLoading(false)

    router.events.on("routeChangeStart", handleStart)
    router.events.on("routeChangeComplete", handleStop)
    router.events.on("routeChangeError", handleStop)

    return () => {
      router.events.off("routeChangeStart", handleStart)
      router.events.off("routeChangeComplete", handleStop)
      router.events.off("routeChangeError", handleStop)
    }
  }, [router])

  return (
    <RecoilRoot>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          components: {
            Box: {
              defaultProps: {
                color: "#424242"
              }
            },
            Flex: {
              defaultProps: {
                color: "#424242"
              }
            },
            Text: {
              defaultProps: {
                color: "#424242"
              }
            },
            Title: {
              defaultProps: {
                color: "#424242"
              }
            }
          },
          colors: {
            spotify: [
              "#E8FCF0",
              "#BFF8D4",
              "#95F3B9",
              "#6CEF9D",
              "#43EA82",
              "#19E666",
              "#14B852",
              "#0F8A3D",
              "#0A5C29",
              "#052E14"
            ]
          },
          colorScheme: "light",
          fontFamily: "NotoSansJP, GreycliffCF, Kazesawa"
        }}
      >
        <CustomFonts />

        {/** 背景 */}
        <VercelShape />

        {isLoading ? <LoadingAnimation /> : <Component {...pageProps} />}
      </MantineProvider>
    </RecoilRoot>
  )
}
