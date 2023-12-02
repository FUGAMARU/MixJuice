import { useOs } from "@mantine/hooks"
import { signOut } from "firebase/auth"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useRecoilValue, useSetRecoilState } from "recoil"
import useErrorModal from "./useErrorModal"
import useSpotifyApi from "./useSpotifyApi"
import useSpotifySettingState from "./useSpotifySettingState"
import useSpotifyToken from "./useSpotifyToken"
import useStorage from "./useStorage"
import useTouchDevice from "./useTouchDevice"
import useWebDAVSettingState from "./useWebDAVSettingState"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import { loadingAtom } from "@/atoms/loadingAtom"
import { spotifySettingStateAtom } from "@/atoms/spotifySettingStateAtom"
import { userDataAtom } from "@/atoms/userDataAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { PAGE_PATH } from "@/constants/PagePath"
import { isPagePath } from "@/types/PagePath"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"
import { generateRandomNumber } from "@/utils/randomNumberGenerator"

const useInitializer = () => {
  /** MixJuiceを開いた時に実行したい、かつJSXに直接関係ない処理はこのフック内で行う */

  const router = useRouter()
  const pathname = usePathname()
  const setIsLoading = useSetRecoilState(loadingAtom)
  const [userInfo, isLoadingUserInfo] = useAuthState(auth)
  const userData = useRecoilValue(userDataAtom)
  const { showWarning } = useErrorModal()
  const os = useOs()
  const isTouchDevice = useTouchDevice()
  const spotifySettingState = useRecoilValue(spotifySettingStateAtom)
  const webDAVSettingState = useRecoilValue(spotifySettingStateAtom)

  useSpotifyApi({ initialize: true })
  useSpotifyToken({ initialize: true })
  useStorage({ initialize: true })

  useSpotifySettingState({ initialize: true })
  useWebDAVSettingState({ initialize: true })

  const setFaviconIndex = useSetRecoilState(faviconIndexAtom)
  useEffect(() => {
    setFaviconIndex(generateRandomNumber(1, 12))
  }, [setFaviconIndex])

  useEffect(() => {
    if (os === "undetermined") return
    if (os === "ios" || (os === "macos" && isTouchDevice)) {
      showWarning("iOSまたはiPad OSでは楽曲の再生が自動で開始されません")
    }
  }, [os, showWarning, isTouchDevice])

  useEffect(() => {
    ;(async () => {
      if (!isPagePath(pathname)) return

      /** 【サインインページに飛ばす条件】
       * サインインページ以外においてユーザーの認証情報が読み込み中でない、かつ
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
        if (pathname !== PAGE_PATH.SIGNIN_PAGE) {
          await signOut(auth) // 共通鍵がLocalStorageに存在しないという理由でサインインページに飛ばす場合、先にサインアウトさせておかないとサインインページに飛ばされてもログイン済み扱いになるためまたメインページに飛ばされてしまう
          router.push(PAGE_PATH.SIGNIN_PAGE)
          return
        }
        setIsLoading({
          stateChangedOn: pathname,
          state: false
        })
        return
      }

      /** userDataが読み込まれていないとSpotifyやWebDAVの接続状況を正しく判定できないのでここで弾く */
      if (!isDefined(userData)) return

      /** 【接続ページに飛ばす条件】
       *  接続ページ以外においてSpotifyとWebDAVの設定が完了していない場合は接続ページに飛ばす
       * (どちらかの設定が完了しているならばリダイレクトの対象としない)
       */
      if (
        pathname !== PAGE_PATH.CONNECT_PAGE &&
        isDefined(spotifySettingState) &&
        isDefined(webDAVSettingState) &&
        spotifySettingState !== "done" &&
        webDAVSettingState !== "done"
      ) {
        router.push(PAGE_PATH.CONNECT_PAGE)
        return
      }

      /** ここに処理が来る時点でログインや各サービスとの接続設定は完了しているので、サインインページにアクセスしてきた時は強制的にメインページに飛ばす */
      if (pathname === PAGE_PATH.SIGNIN_PAGE) {
        router.push(PAGE_PATH.MAIN_PAGE)
        return
      }

      setIsLoading({
        stateChangedOn: pathname,
        state: false
      })
    })()
  }, [
    isLoadingUserInfo,
    userInfo,
    router,
    pathname,
    spotifySettingState,
    webDAVSettingState,
    setIsLoading,
    userData
  ])

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
