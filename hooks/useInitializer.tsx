import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useSetRecoilState } from "recoil"
import useSpotifyApi from "./useSpotifyApi"
import useSpotifySettingState from "./useSpotifySettingState"
import useSpotifyToken from "./useSpotifyToken"
import useStorage from "./useStorage"
import useWebDAVSettingState from "./useWebDAVSettingState"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import { loadingAtom } from "@/atoms/loadingAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { PAGE_PATH } from "@/constants/PagePath"
import { isPagePath } from "@/types/PagePath"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"
import { generateRandomNumber } from "@/utils/randomNumberGenerator"

const useInitializer = () => {
  /** MixJuiceを開いた時に実行したい、かつ表示に直接関係ない処理はこのフック内で行う */

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const setIsLoading = useSetRecoilState(loadingAtom)
  const [userInfo, isLoadingUserInfo] = useAuthState(auth)

  useSpotifyApi({ initialize: true })
  useSpotifyToken({ initialize: true })
  useStorage({ initialize: true })

  useSpotifySettingState({ initialize: true })
  useWebDAVSettingState({ initialize: true })

  const setFaviconIndex = useSetRecoilState(faviconIndexAtom)
  useEffect(() => {
    setFaviconIndex(generateRandomNumber(1, 12))
  }, [setFaviconIndex])

  /** ページ遷移完了のイベントはここで拾う */
  useEffect(() => {
    ;(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (isPagePath(pathname)) {
        setIsLoading({
          stateChangedOn: pathname,
          state: false
        })
      }
    })()
  }, [pathname, searchParams, setIsLoading])

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
      router.push(PAGE_PATH.SIGNIN_PAGE)
      return
    }

    setIsLoading({
      stateChangedOn: PAGE_PATH.MAIN_PAGE,
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
