import { headers } from "next/headers"
import { memo } from "react"
import SpotifyApiCallbackPage from "./SpotifyApiCallbackPage"

const SpotifyApiCallback = () => {
  headers() // SSR強制用 (Strict CSP用)

  return <SpotifyApiCallbackPage />
}

export default memo(SpotifyApiCallback)
