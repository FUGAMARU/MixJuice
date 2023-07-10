import { headers } from "next/headers"
import SpotifyApiCallbackPage from "./SpotifyApiCallbackPage"

const SpotifyApiCallback = () => {
  headers() // SSR強制用 (Strict CSP用)

  return <SpotifyApiCallbackPage />
}

export default SpotifyApiCallback
