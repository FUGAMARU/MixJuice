import axios from "axios"
import { useCallback } from "react"
import { WEBDAV_API_PATHS } from "@/constants/WebDAVApiPaths"

const useWebDAV = () => {
  const connect = useCallback(
    async (address: string, user: string, password: string) => {
      try {
        await axios.post(WEBDAV_API_PATHS.CHECK_AUTH, {
          address,
          user,
          password
        })
      } catch (e) {
        console.log("🟥ERROR: ", e)
        throw Error("WebDAVサーバーへの接続に失敗しました")
      }
    },
    []
  )

  return { connect } as const
}

export default useWebDAV
