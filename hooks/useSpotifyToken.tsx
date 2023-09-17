import axios from "axios"
import { useState, useEffect, useCallback } from "react"
import { useRecoilState } from "recoil"
import { spotifyAccessTokenAtom } from "@/atoms/spotifyAccessTokenAtom"
import { SpotifyAuthError } from "@/classes/SpotifyAuthError"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { Pkce } from "@/types/Pkce"

type Props = {
  initialize: boolean
}

const useSpotifyToken = ({ initialize }: Props) => {
  /** 参考: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow */

  const [accessToken, setAccessToken] = useRecoilState(spotifyAccessTokenAtom) // useStateを使うとSpotifyの設定画面を離れた場合にアクセストークンが消えるのでRecoilを使う

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

  const getCode = useCallback(
    async (clientId: string, redirectUri: string) => {
      const codeVerifier = generateRandomString(128)
      const codeChallenge = await generateCodeChallenge(codeVerifier)

      const state = generateRandomString(16)
      const scope =
        "user-read-private user-read-email playlist-read-private playlist-read-collaborative streaming"

      localStorage.setItem(
        LOCAL_STORAGE_KEYS.PKCE_CONFIG,
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
    },
    [generateCodeChallenge, generateRandomString]
  )

  const getAccessToken = useCallback(
    async (code: string) => {
      const pkceConfig = localStorage.getItem(LOCAL_STORAGE_KEYS.PKCE_CONFIG)

      if (pkceConfig === null)
        throw Error(
          "Spotify APIのアクセストークン取得に必要な情報が存在しません"
        )

      const { clientId, redirectUri, codeVerifier } = JSON.parse(
        pkceConfig
      ) as Pkce

      localStorage.setItem(LOCAL_STORAGE_KEYS.SPOTIFY_CLIENT_ID, clientId)

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

        localStorage.setItem(
          LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
          res.data.refresh_token
        )

        localStorage.removeItem(LOCAL_STORAGE_KEYS.PKCE_CONFIG)
      } catch (e) {
        console.log("🟥ERROR: ", e)
        throw Error("Spotify APIのアクセストークンの取得に失敗しました")
      }
    },
    [setAccessToken]
  )

  const deleteAuthConfig = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN)
    setAccessToken(undefined)
  }, [setAccessToken])

  const refreshAccessToken = useCallback(async () => {
    console.log("🟦DEBUG: Spotify APIのアクセストークンを更新します")

    const clientId = localStorage.getItem(LOCAL_STORAGE_KEYS.SPOTIFY_CLIENT_ID)
    const refreshToken = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN
    )

    if (clientId === null || refreshToken === null) {
      deleteAuthConfig()
      throw new SpotifyAuthError(
        "Spotify APIのアクセストークンの更新に必要な情報が存在しませんでした。Spotifyに再ログインしてください。"
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

      console.log("🟩DEBUG: Spotify APIのアクセストークンの更新に成功しました")
      console.log(
        `新しく取得したSpotify APIのアクセストークンの失効日時は ${new Date(
          expiresAt * 1000
        )} です`
      )

      setAccessToken({
        token,
        expiresAt
      })

      localStorage.setItem(
        LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
        res.data.refresh_token
      )

      return token
    } catch (e) {
      console.log("🟥ERROR: ", e)
      deleteAuthConfig()
      throw new SpotifyAuthError(
        "Spotify APIのアクセストークンの更新に失敗しました。Spotifyに再ログインしてください。"
      )
    }
  }, [setAccessToken, deleteAuthConfig])

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
