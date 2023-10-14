import { headers } from "next/headers"
import { memo } from "react"
import SigninPage from "./SigninPage"

const Signin = () => {
  headers() // SSR強制用 (Strict CSP用)

  return <SigninPage />
}

export default memo(Signin)
