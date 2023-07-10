import { headers } from "next/headers"
import ConnectPage from "./ConnectPage"

const Connect = () => {
  headers() // SSR強制用 (Strict CSP用)

  return <ConnectPage />
}

export default Connect
