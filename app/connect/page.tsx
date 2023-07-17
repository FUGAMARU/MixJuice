import { headers } from "next/headers"
import { memo } from "react"
import ConnectPage from "./ConnectPage"

const Connect = () => {
  headers() // SSR強制用 (Strict CSP用)

  return <ConnectPage />
}

export default memo(Connect)
