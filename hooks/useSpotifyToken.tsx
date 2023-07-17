import axios from "axios"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRecoilState } from "recoil"
import { spotifyAccessTokenAtom } from "@/atoms/spotifyAccessTokenAtom"
import { SpotifyAuthError } from "@/classes/SpotifyAuthError"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { Pkce } from "@/types/Pkce"

const useSpotifyToken = () => {
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
        throw Error("アクセストークン取得に必要な情報が存在しません")

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
        // 例外が発生した場合の起点なので(eには自分で設定したエラーメッセージは入っていないので)setErrorModalInstanceは行わない
        console.log("🟥ERROR: ", e)
        throw Error("アクセストークンの取得に失敗しました")
      }
    },
    [setAccessToken]
  )

  const deleteAuthConfig = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN)
    setAccessToken(undefined)
  }, [setAccessToken])

  const refreshAccessToken = useCallback(async () => {
    console.log("🟦DEBUG: アクセストークンを更新します")

    const clientId = localStorage.getItem(LOCAL_STORAGE_KEYS.SPOTIFY_CLIENT_ID)
    const refreshToken = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN
    )

    if (clientId === null || refreshToken === null) {
      deleteAuthConfig()
      throw new SpotifyAuthError(
        "アクセストークンの更新に必要な情報が存在しませんでした。Spotifyに再ログインしてください。"
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

      const accessToken = res.data.access_token as string

      setAccessToken({
        token: accessToken,
        expiresAt: Math.floor(Date.now() / 1000) + Number(res.data.expires_in)
      })

      localStorage.setItem(
        LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
        res.data.refresh_token
      )

      return accessToken
    } catch (e) {
      // 例外が発生した場合の起点なので(eには自分で設定したエラーメッセージは入っていないので)setErrorModalInstanceは行わない
      console.log("🟥ERROR: ", e)
      deleteAuthConfig()
      throw new SpotifyAuthError(
        "アクセストークンの更新に失敗しました。Spotifyに再ログインしてください。"
      )
    }
  }, [setAccessToken, deleteAuthConfig])

  const hasValidAccessTokenState = useMemo(() => {
    const offset = 60 // 単位: 秒 | アクセストークンのリフレッシュは期限を迎えるより少し前に行う
    return (
      accessToken !== undefined &&
      Number(accessToken.expiresAt) - offset > Math.floor(Date.now() / 1000)
    )
  }, [accessToken])

  return {
    redirectUri,
    getCode,
    getAccessToken,
    refreshAccessToken,
    hasValidAccessTokenState
  } as const
}

export default useSpotifyToken
