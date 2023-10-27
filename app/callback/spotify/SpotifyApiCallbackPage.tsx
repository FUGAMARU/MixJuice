"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { memo, useEffect, useRef } from "react"
import { PAGE_PATH } from "@/constants/PagePath"
import useErrorModal from "@/hooks/useErrorModal"
import useSpotifyToken from "@/hooks/useSpotifyToken"
import useStorage from "@/hooks/useStorage"
import { isDefined } from "@/utils/isDefined"

const SpotifyApiCallbackPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getAccessToken } = useSpotifyToken({ initialize: false })
  const hasApiCalledRef = useRef(false)
  const { showError } = useErrorModal()
  const { userData } = useStorage({ initialize: false })

  useEffect(() => {
    ;(async () => {
      if (hasApiCalledRef.current || !isDefined(userData)) return

      hasApiCalledRef.current = true

      try {
        if (searchParams === null)
          throw new Error("パラメーターが指定されていません")
        const code = searchParams.get("code")
        if (code === null) throw new Error("パラメーターが指定されていません")

        await getAccessToken(code)
      } catch (e) {
        showError(e)
      } finally {
        router.push(`${PAGE_PATH.CONNECT_PAGE}?provider=spotify`)
      }
    })()
  }, [searchParams, router, getAccessToken, showError, userData])

  return null
}

export default memo(SpotifyApiCallbackPage)
