import { useCallback, useEffect } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"
import useStorage from "./useStorage"
import { selectedWebDAVFoldersAtom } from "@/atoms/selectedWebDAVFoldersAtom"
import { webDAVSettingStateAtom } from "@/atoms/webDAVSettingStateAtom"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { isDefined } from "@/utils/isDefined"

type Args = {
  initialize: boolean
}

const useWebDAVSettingState = ({ initialize }: Args) => {
  const { userData } = useStorage({ initialize: false })

  /**
   * done: WebDAVサーバーへのログイン・フォルダーの指定が完了している
   * setting: WebDAVサーバーへのログインは完了しているが、フォルダーの指定が完了していない
   * none: WebDAVサーバーへのログインが完了していない
   */
  const setSettingState = useSetRecoilState(webDAVSettingStateAtom)
  const [folderPath, setFolderPath] = useRecoilState(selectedWebDAVFoldersAtom)

  const getSettingState = useCallback(
    (serverCredentials: string | undefined) => {
      if (!isDefined(serverCredentials)) return "none"

      if (folderPath.length === 0) return "setting"

      return "done"
    },
    [folderPath.length]
  )

  useEffect(() => {
    if (!initialize) return

    const serverCredentials =
      userData?.[FIRESTORE_DOCUMENT_KEYS.WEBDAV_SERVER_CREDENTIALS]
    const settingState = getSettingState(serverCredentials)
    setSettingState(settingState)
  }, [userData, folderPath, setSettingState, getSettingState, initialize])

  /** ページロード時のlocalStorageからRecoilStateへの反映 */
  useEffect(() => {
    const folderPath = localStorage.getItem(
      LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS
    )

    if (folderPath !== null) setFolderPath(JSON.parse(folderPath))
  }, [setFolderPath])

  return { getSettingState } as const
}

export default useWebDAVSettingState
