"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { getAccessToken } from "@/utils/spotify-api"

const SpotifyApiCallbackPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleGetAccessToken = useCallback(async (code: string) => {
    try {
      await getAccessToken(code)
    } catch (e) {
      throw e
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        if (searchParams === null)
          throw new Error("パラメーターが指定されていません")
        const code = searchParams.get("code")
        if (code === null) throw new Error("パラメーターが指定されていません")

        await handleGetAccessToken(code)
      } catch (e) {
        //TODO: ちゃんとしたエラー表示を実装する
        if (e instanceof Error) alert(e.message)
      } finally {
        router.push("/connect")
      }
    })()
  }, [handleGetAccessToken, router, searchParams])
}

export default SpotifyApiCallbackPage
