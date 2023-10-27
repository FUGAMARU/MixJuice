import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useSetRecoilState } from "recoil"
import useSetSpotifySettingState from "./useSetSpotifySettingState"
import useSpotifyApi from "./useSpotifyApi"
import useSpotifyToken from "./useSpotifyToken"
import useStorage from "./useStorage"
import useSetWebDAVSettingState from "./useWebDAVSettingState"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import { loadingAtom } from "@/atoms/loadingAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"
import { generateRandomNumber } from "@/utils/randomNumberGenerator"

const useInitializer = () => {
  /** MixJuiceを開いた時に実行したい、かつ表示に直接関係ない処理はこのフック内で行う */

  const router = useRouter()
  const setIsLoading = useSetRecoilState(loadingAtom)
  const [userInfo, isLoadingUserInfo] = useAuthState(auth)

  useSpotifyApi({ initialize: true })
  useSpotifyToken({ initialize: true })
  useStorage({ initialize: true })

  useSetSpotifySettingState()
  useSetWebDAVSettingState()

  const setFaviconIndex = useSetRecoilState(faviconIndexAtom)
  useEffect(() => {
    setFaviconIndex(generateRandomNumber(1, 12))
  }, [setFaviconIndex])

  useEffect(() => {
    /** 【サインインページに飛ばす条件】
     * ユーザーの認証情報が読み込み中でない、かつ
     * ①ユーザー情報が空 (ユーザー登録が済んでいない or ログインしていない)
     * ②メールアドレスの認証が完了していない
     * ③LocalStorageにデーターの復号化キーが存在しない
     * のいずれかに該当する場合はサインインページに飛ばす
     */
    const decryptionKey = localStorage.getItem(
      LOCAL_STORAGE_KEYS.DATA_DECRYPTION_KEY
    )
    if (
      !isLoadingUserInfo &&
      userInfo !== undefined && // isDefinedは使えないので注意(nullとundefinedを区別する必要があるため)
      (userInfo === null || // isDefinedは使えないので注意(nullとundefinedを区別する必要があるため)
        !userInfo.emailVerified ||
        !isDefined(decryptionKey))
    ) {
      router.push("/signin")
      return
    }

    setIsLoading({
      stateChangedOn: "SigninPage",
      state: false
    })
  }, [setIsLoading, isLoadingUserInfo, userInfo, router])

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
