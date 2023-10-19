import { useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useSetRecoilState } from "recoil"
import useSetSpotifySettingState from "./useSetSpotifySettingState"
import useSpotifyApi from "./useSpotifyApi"
import useSpotifyToken from "./useSpotifyToken"
import useSetWebDAVSettingState from "./useWebDAVSettingState"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { auth } from "@/utils/firebase"
import { generateRandomNumber } from "@/utils/randomNumberGenerator"

const useInitializer = () => {
  /** MixJuiceを開いた時に実行したい、かつ表示に直接関係ない処理はこのフック内で行う TODO: ログインチェックなど */

  const [user, loading] = useAuthState(auth)

  useSpotifyApi({ initialize: true })
  useSpotifyToken({ initialize: true })

  useSetSpotifySettingState({ isLoadingUser: loading })
  useSetWebDAVSettingState({ isLoadingUser: loading })

  const setFaviconIndex = useSetRecoilState(faviconIndexAtom)
  useEffect(() => {
    setFaviconIndex(generateRandomNumber(1, 12))
  }, [setFaviconIndex])

  /** 不要説 */
  useEffect(() => {
    const localStorageDataFormatVersion = localStorage.getItem(
      LOCAL_STORAGE_KEYS.LOCAL_STORAGE_DATA_FORMAT_VERSION
    )

    if (!localStorageDataFormatVersion) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.LOCAL_STORAGE_DATA_FORMAT_VERSION,
        "1"
      )
    }
  }, [])

  return { user, isLoadingUser: loading } as const
}

export default useInitializer
