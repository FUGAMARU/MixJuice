import { useEffect, useMemo } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { selectedWebDAVFolderAtom } from "@/atoms/selectedWebDAVFolderAtom"
import { webDAVAuthenticatedAtom } from "@/atoms/webDAVAuthenticatedAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { ProviderSettingState } from "@/types/ProviderSettingState"

const useWebDAVSettingState = () => {
  /**
   * done: WebDAVサーバーへのログイン・フォルダーの指定が完了している
   * setting: WebDAVサーバーへのログインは完了しているが、フォルダーの指定が完了していない
   * none: WebDAVサーバーへのログインが完了していない
   */
  const [isAuthenticated, setIsAuthenticated] = useRecoilState(
    webDAVAuthenticatedAtom
  )
  const folderPath = useRecoilValue(selectedWebDAVFolderAtom)

  const settingState = useMemo<ProviderSettingState>(() => {
    if (isAuthenticated === false) return "none"
    if (folderPath === undefined) return "setting"
    return "done"
  }, [isAuthenticated, folderPath])

  useEffect(() => {
    const isAuthenticated = localStorage.getItem(
      LOCAL_STORAGE_KEYS.WEBDAV_IS_AUTHENTICATED
    )
    if (isAuthenticated === "true") setIsAuthenticated(true)
  }, [setIsAuthenticated])

  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.WEBDAV_IS_AUTHENTICATED,
      isAuthenticated ? "true" : "false"
    )
  }, [isAuthenticated])

  return { settingState } as const
}

export default useWebDAVSettingState
