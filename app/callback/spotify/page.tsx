"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"
import useSpotifyToken from "@/hooks/useSpotifyToken"

const SpotifyApiCallbackPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getAccessToken } = useSpotifyToken()
  const hasApiCalledRef = useRef(false)

  const handleGetAccessToken = useCallback(
    async (code: string) => {
      try {
        await getAccessToken(code)
      } catch (e) {
        throw e
      }
    },
    [getAccessToken]
  )

  useEffect(() => {
    ;(async () => {
      if (hasApiCalledRef.current) return
      hasApiCalledRef.current = true

      try {
        if (searchParams === null)
          throw new Error("パラメーターが指定されていません")
        const code = searchParams.get("code")
        if (code === null) throw new Error("パラメーターが指定されていません")

        await handleGetAccessToken(code)
      } catch (e) {
        console.log("🟥ERROR: ", e)
        if (e instanceof Error) alert(e.message) //TODO: ちゃんとしたエラー表示を実装する
      } finally {
        router.push("/connect")
      }
    })()
  }, [searchParams, router, handleGetAccessToken])
}

export default SpotifyApiCallbackPage
