import { headers } from "next/headers"
import MainPage from "./MainPage"

const Page = () => {
  headers() // SSR強制用 (Strict CSP用)

  return <MainPage />
}

export default Page
