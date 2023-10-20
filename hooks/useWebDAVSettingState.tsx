import { useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useRecoilState, useSetRecoilState } from "recoil"
import { selectedWebDAVFoldersAtom } from "@/atoms/selectedWebDAVFoldersAtom"
import { webDAVAuthenticatedAtom } from "@/atoms/webDAVAuthenticatedAtom"
import { webDAVSettingStateAtom } from "@/atoms/webDAVSettingStateAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { auth } from "@/utils/firebase"

const useSetWebDAVSettingState = () => {
  const [, isLoadingUser] = useAuthState(auth)

  /**
   * done: WebDAVサーバーへのログイン・フォルダーの指定が完了している
   * setting: WebDAVサーバーへのログインは完了しているが、フォルダーの指定が完了していない
   * none: WebDAVサーバーへのログインが完了していない
   */
  const [isAuthenticated, setIsAuthenticated] = useRecoilState(
    webDAVAuthenticatedAtom
  )
  const [folderPath, setFolderPath] = useRecoilState(selectedWebDAVFoldersAtom)

  const setSettingState = useSetRecoilState(webDAVSettingStateAtom)
  useEffect(() => {
    if (isAuthenticated === false) {
      setSettingState("none")
      return
    }

    if (folderPath === undefined) {
      setSettingState("setting")
      return
    }

    setSettingState("done")
  }, [isAuthenticated, folderPath, setSettingState])

  /** ページロード時のlocalStorageからRecoilStateへの反映 */
  useEffect(() => {
    const isAuthenticated = localStorage.getItem(
      LOCAL_STORAGE_KEYS.WEBDAV_IS_AUTHENTICATED
    )
    if (isAuthenticated === "true") setIsAuthenticated(true)

    const folderPath = localStorage.getItem(
      LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS
    )
    if (folderPath !== null) setFolderPath(JSON.parse(folderPath))
  }, [setIsAuthenticated, setFolderPath])

  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.WEBDAV_IS_AUTHENTICATED,
      isAuthenticated ? "true" : "false"
    )
  }, [isAuthenticated])
}

export default useSetWebDAVSettingState
