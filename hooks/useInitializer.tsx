import { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import useSetSpotifySettingState from "./useSetSpotifySettingState"
import useSpotifyApi from "./useSpotifyApi"
import useSpotifyToken from "./useSpotifyToken"
import useStorage from "./useStorage"
import useSetWebDAVSettingState from "./useWebDAVSettingState"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { generateRandomNumber } from "@/utils/randomNumberGenerator"

const useInitializer = () => {
  /** MixJuiceを開いた時に実行したい、かつ表示に直接関係ない処理はこのフック内で行う TODO: ログインチェックなど */

  useSpotifyApi({ initialize: true })
  useSpotifyToken({ initialize: true })
  useStorage({ initialize: true })

  useSetSpotifySettingState()
  useSetWebDAVSettingState()

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
}

export default useInitializer
