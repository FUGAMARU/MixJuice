import axios from "axios"
import { useCallback } from "react"
import { WEBDAV_API_PATHS } from "@/constants/WebDAVApiPaths"

const useWebDAVApi = () => {
  const checkAuth = useCallback(
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

  const checkIsFolderExists = useCallback(
    async (address: string, user: string, password: string, path: string) => {
      try {
        await axios.post(WEBDAV_API_PATHS.FOLDER_EXISTS, {
          address,
          user,
          password,
          path
        })
      } catch (e) {
        console.log("🟥ERROR: ", e)
        throw Error("指定されたパスのフォルダーが存在しません")
      }
    },
    []
  )

  return { checkAuth, checkIsFolderExists } as const
}

export default useWebDAVApi
