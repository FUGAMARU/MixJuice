"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"
import { useSetRecoilState } from "recoil"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import useSpotifyToken from "@/hooks/useSpotifyToken"

const SpotifyApiCallbackPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getAccessToken } = useSpotifyToken()
  const hasApiCalledRef = useRef(false)
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)

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
        setErrorModalInstance(prev => [...prev, e])
      } finally {
        router.push("/connect")
      }
    })()
  }, [searchParams, router, handleGetAccessToken, setErrorModalInstance])
}

export default SpotifyApiCallbackPage
