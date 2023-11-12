import axios from "axios"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRecoilState } from "recoil"
import useLogger from "./useLogger"
import useStorage from "./useStorage"
import { spotifyAccessTokenAtom } from "@/atoms/spotifyAccessTokenAtom"
import { SpotifyAuthError } from "@/classes/SpotifyAuthError"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { SESSION_STORAGE_KEYS } from "@/constants/SessionStorageKeys"
import { Pkce } from "@/types/Pkce"
import { isDefined } from "@/utils/isDefined"

type Props = {
  initialize: boolean
}

const useSpotifyToken = ({ initialize }: Props) => {
  /** 参考: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow */

  const showLog = useLogger()
  const [accessToken, setAccessToken] = useRecoilState(spotifyAccessTokenAtom) // useStateを使うとSpotifyの設定画面を離れた場合にアクセストークンが消えるのでRecoilを使う
  const { userData, updateUserData, deleteUserData } = useStorage({
    initialize: false
  })
  const clientId = useMemo(() => process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID, [])

  /** 現在のアドレスからコールバック用のリダイレクトURIを求める */
  const [redirectUri, setRedirectUri] = useState("")
  useEffect(() => {
    const currentURL = window.location.href
    const url = new URL(currentURL)
    setRedirectUri(`${url.protocol}//${url.host}/callback/spotify`)
  }, [])

  /** Code Verifierの生成 */
  const generateRandomString = useCallback((length: number) => {
    let text = ""
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }, [])

  /** Code Challengeの生成 */
  const generateCodeChallenge = useCallback(async (codeVerifier: string) => {
    const base64urlEncode = (str: string) =>
      btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const digest = await window.crypto.subtle.digest("SHA-256", data)

    return base64urlEncode(
      Array.from(new Uint8Array(digest))
        .map(byte => String.fromCharCode(byte))
        .join("")
    )
  }, [])

  const getCode = useCallback(async () => {
    if (!isDefined(clientId))
      throw new Error(
        "Spotify APIの認証に必要な環境変数 NEXT_PUBLIC_SPOTIFY_CLIENT_ID が設定されていません。サーバー管理者にお問い合わせください。"
      )

    const codeVerifier = generateRandomString(128)
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    const state = generateRandomString(16)
    const scope =
      "user-read-private user-read-email playlist-read-private playlist-read-collaborative streaming"

    sessionStorage.setItem(
      SESSION_STORAGE_KEYS.SPOTIFY_PKCE_CONFIG,
      JSON.stringify({ codeVerifier, clientId, redirectUri } as Pkce)
    )

    return new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
      state,
      code_challenge_method: "S256",
      code_challenge: codeChallenge
    })
  }, [generateCodeChallenge, generateRandomString, clientId, redirectUri])

  const getAccessToken = useCallback(
    async (code: string) => {
      const pkceConfig = sessionStorage.getItem(
        SESSION_STORAGE_KEYS.SPOTIFY_PKCE_CONFIG
      )

      if (pkceConfig === null)
        throw new SpotifyAuthError(
          "Spotify APIのアクセストークン取得に必要な情報が存在しません。Spotifyに再ログインしてください。"
        )

      const { clientId, redirectUri, codeVerifier } = JSON.parse(
        pkceConfig
      ) as Pkce

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
      })

      try {
        const res = await axios.post("/spotify-token", body, {
          headers: {
            ContentType: "application/x-www-form-urlencoded"
          }
        })

        setAccessToken({
          token: res.data.access_token,
          expiresAt: Math.floor(Date.now() / 1000) + Number(res.data.expires_in)
        })

        await updateUserData(
          FIRESTORE_DOCUMENT_KEYS.SPOTIFY_REFRESH_TOKEN,
          res.data.refresh_token
        )

        sessionStorage.removeItem(SESSION_STORAGE_KEYS.SPOTIFY_PKCE_CONFIG)
      } catch (e) {
        showLog("error", e)
        throw new SpotifyAuthError(
          "Spotify APIのアクセストークンの取得に失敗しました。Spotifyに再ログインしてください。"
        )
      }
    },
    [setAccessToken, updateUserData, showLog]
  )

  const deleteAuthConfig = useCallback(async () => {
    await deleteUserData(FIRESTORE_DOCUMENT_KEYS.SPOTIFY_REFRESH_TOKEN)
    setAccessToken(undefined)
  }, [setAccessToken, deleteUserData])

  const refreshAccessToken = useCallback(async () => {
    showLog("info", "Spotify APIのアクセストークンを更新します")

    const refreshToken =
      userData?.[FIRESTORE_DOCUMENT_KEYS.SPOTIFY_REFRESH_TOKEN]

    if (!isDefined(clientId) || !isDefined(refreshToken)) {
      await deleteAuthConfig()
      throw new SpotifyAuthError(
        "Spotify APIのアクセストークンの更新に必要な情報が存在しません。Spotifyに再ログインしてください。"
      )
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId
    })

    try {
      const res = await axios.post("/spotify-token", body, {
        headers: {
          ContentType: "application/x-www-form-urlencoded"
        }
      })

      const token = res.data.access_token as string
      const expiresAt =
        Math.floor(Date.now() / 1000) + Number(res.data.expires_in)

      showLog("success", "Spotify APIのアクセストークンの更新に成功しました")
      showLog(
        "none",
        `新しく取得したSpotify APIのアクセストークンの失効日時は ${new Date(
          expiresAt * 1000
        )} です`
      )

      setAccessToken({
        token,
        expiresAt
      })

      await updateUserData(
        FIRESTORE_DOCUMENT_KEYS.SPOTIFY_REFRESH_TOKEN,
        res.data.refresh_token
      )

      return token
    } catch (e) {
      showLog("error", e)
      await deleteAuthConfig()
      throw new SpotifyAuthError(
        "Spotify APIのアクセストークンの更新に失敗しました。Spotifyに再ログインしてください。"
      )
    }
  }, [
    setAccessToken,
    deleteAuthConfig,
    updateUserData,
    userData,
    clientId,
    showLog
  ])

  /* useMemoにすると、Date.nowがaccessTokenの取得が完了した時点で固定されるのでuseCallbackにする必要がある */
  const hasValidAccessTokenState = useCallback(() => {
    const offset = 60 // 単位: 秒 | アクセストークンのリフレッシュは期限を迎えるより少し前に行う
    return (
      accessToken !== undefined &&
      accessToken.expiresAt - offset > Math.floor(Date.now() / 1000)
    )
  }, [accessToken])

  /** 30分毎に自動でアクセストークンを更新する
   * Spotify WebPlayback SDKは一定間隔でhttps://cpapi.spotify.com/v1/client/{id}/get_next?timestamp={timestamp}を叩いているようだが、
   * WebPlayback SDKによるAPIアクセスはAxiosのインターセプターを経由しないため、アクセストークンの期限切れが感知できず、アクセストークンの更新処理も行うことができない。
   * 仕方がないのでイベントドリブンでは無い方法でアクセストークンを自動的に定期的に更新する
   */
  useEffect(() => {
    if (!initialize) return

    const interval = setInterval(
      async () => {
        if (!accessToken) return
        await refreshAccessToken()
      },
      1000 * 60 * 30 // 30分
    )

    return () => {
      clearInterval(interval)
    }
  }, [refreshAccessToken, accessToken, initialize])

  return {
    redirectUri,
    getCode,
    getAccessToken,
    refreshAccessToken,
    hasValidAccessTokenState
  } as const
}

export default useSpotifyToken
