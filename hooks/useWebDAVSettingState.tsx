import { useEffect } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"
import useStorage from "./useStorage"
import { selectedWebDAVFoldersAtom } from "@/atoms/selectedWebDAVFoldersAtom"
import { webDAVAuthenticatedAtom } from "@/atoms/webDAVAuthenticatedAtom"
import { webDAVSettingStateAtom } from "@/atoms/webDAVSettingStateAtom"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { isDefined } from "@/utils/isDefined"

const useSetWebDAVSettingState = () => {
  const { userData } = useStorage({ initialize: false })

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
    if (!isAuthenticated) {
      setSettingState("none")
      return
    }

    if (folderPath.length === 0) {
      setSettingState("setting")
      return
    }

    setSettingState("done")
  }, [isAuthenticated, folderPath, setSettingState])

  /** ページロード時のlocalStorageからRecoilStateへの反映 */
  useEffect(() => {
    const serverCredentials =
      userData?.[FIRESTORE_DOCUMENT_KEYS.WEBDAV_SERVER_CREDENTIALS]
    if (isDefined(serverCredentials)) setIsAuthenticated(true)

    const folderPath = localStorage.getItem(
      LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS
    )

    if (folderPath !== null) setFolderPath(JSON.parse(folderPath))
  }, [setIsAuthenticated, setFolderPath, userData])
}

export default useSetWebDAVSettingState
