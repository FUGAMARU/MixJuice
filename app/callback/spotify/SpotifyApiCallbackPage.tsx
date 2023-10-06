"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { memo, useCallback, useEffect, useRef } from "react"
import useErrorModal from "@/hooks/useErrorModal"
import useSpotifyToken from "@/hooks/useSpotifyToken"

const SpotifyApiCallbackPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getAccessToken } = useSpotifyToken({ initialize: false })
  const hasApiCalledRef = useRef(false)
  const { showError } = useErrorModal()

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
        showError(e)
      } finally {
        router.push("/connect?provider=spotify")
      }
    })()
  }, [searchParams, router, handleGetAccessToken, showError])

  return null
}

export default memo(SpotifyApiCallbackPage)
