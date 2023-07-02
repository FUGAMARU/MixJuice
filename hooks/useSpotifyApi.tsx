import axios from "axios"
import { useCallback, useEffect, useMemo, useState } from "react"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { CheckboxListModalItem } from "@/types/CheckboxListModalItem"
import { Pkce } from "@/types/Pkce"

const useSpotifyApi = () => {
  /** 参考: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow */

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
        "user-read-private user-read-email playlist-read-private playlist-read-collaborative"

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

  const getAccessToken = useCallback(async (code: string) => {
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

      localStorage.setItem(
        LOCAL_STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN,
        res.data.access_token
      )
      setAccessToken(res.data.access_token)
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN,
        res.data.refresh_token
      )
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN_EXPIRES_AT,
        (Math.floor(Date.now() / 1000) + Number(res.data.expires_in)).toString()
      )
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PKCE_CONFIG)
    } catch (e) {
      throw Error("アクセストークンの取得に失敗しました")
    }
  }, [])

  const refreshAccessToken = useCallback(async () => {
    console.log("🟦DEBUG: アクセストークンを更新します")

    const clientId = localStorage.getItem(LOCAL_STORAGE_KEYS.SPOTIFY_CLIENT_ID)
    const refreshToken = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN
    )

    if (clientId === null) throw Error("ClientIDが見つかりませんでした")
    if (refreshToken === null)
      throw Error("リフレッシュトークンが見つかりませんでした")

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

      localStorage.setItem(LOCAL_STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN, accessToken)
      setAccessToken(accessToken)
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN_EXPIRES_AT,
        (Math.floor(Date.now() / 1000) + Number(res.data.expires_in)).toString()
      )

      return accessToken
    } catch {
      // TODO: Spotifyの認証に関連する情報をlocalStorageから削除する
      throw Error(
        "アクセストークンの更新に失敗しました。Spotifyに再ログインしてください。"
      )
    }
  }, [])

  const [accessToken, setAccessToken] = useState<string | undefined>()
  useEffect(() => {
    setAccessToken(
      localStorage.getItem(LOCAL_STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN) || ""
    )
  }, [])

  const spotifyApi = useMemo(
    () =>
      axios.create({
        baseURL: "/spotify-api",
        headers: {
          ContentType: "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        responseType: "json"
      }),
    [accessToken]
  )

  useEffect(() => {
    /** リクエストインターセプター */
    spotifyApi.interceptors.request.use(
      async config => {
        /** リクエスト送信前処理 */
        if (typeof accessToken === "undefined")
          return Promise.reject(
            new Error("アクセストークンが設定されていません")
          )

        const tokenExpiresAt = localStorage.getItem(
          LOCAL_STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN_EXPIRES_AT
        )

        if (tokenExpiresAt === null)
          return Promise.reject(
            new Error("アクセストークンの有効期限が設定されていません")
          )

        const offset = 60 // 単位: 秒 | トークンのリフレッシュは期限を迎えるより少し前に行う
        const isExpired =
          Number(tokenExpiresAt) - offset < Math.floor(Date.now() / 1000)
        if (isExpired) {
          try {
            const newAccessToken = await refreshAccessToken()
            config.headers.Authorization = `Bearer ${newAccessToken}`
            return config
          } catch (e) {
            return Promise.reject(e)
          }
        }

        config.headers.Authorization = `Bearer ${accessToken}`
        return config
      },
      error => {
        /** リクエストエラーの処理 */
        console.log("🟥ERROR: リクエストエラー")
        console.log(error)
        return Promise.reject(error)
      }
    )

    /** レスポンスインターセプター */
    spotifyApi.interceptors.response.use(
      response => {
        /** レスポンス正常 (ステータスコードが2xx) */
        return response
      },
      error => {
        /** レスポンス異常 (ステータスコードが2xx以外) */
        console.log("🟥ERROR: レスポンスエラー")
        console.log(error)
        return Promise.reject(error)
      }
    )
  }, [accessToken, refreshAccessToken, spotifyApi])

  /** https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists */
  const getPlaylists = useCallback(async () => {
    let playlists: CheckboxListModalItem[] = []

    try {
      while (true) {
        const res = await spotifyApi.get("/me/playlists", {
          params: {
            limit: 50,
            offset: playlists.length
          }
        })

        const obj = res.data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          imgSrc: item.images[0].url
        }))

        playlists = [...playlists, ...obj]

        if (res.data.next === null) break
      }
    } catch {
      throw Error("プレイリストの取得に失敗しました")
    }

    return playlists
  }, [spotifyApi])

  return {
    redirectUri,
    getCode,
    getAccessToken,
    getPlaylists
  }
}

export default useSpotifyApi
