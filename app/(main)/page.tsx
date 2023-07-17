import { headers } from "next/headers"
import { memo } from "react"
import MainPage from "./MainPage"

const Page = () => {
  headers() // SSR強制用 (Strict CSP用)

  return <MainPage />
}

export default memo(Page)
