import axios from "axios"
import { useCallback, useEffect, useMemo } from "react"
import useSpotifyToken from "./useSpotifyToken"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { CheckboxListModalItem } from "@/types/CheckboxListModalItem"

const useSpotifyApi = () => {
  const { accessToken, refreshAccessToken } = useSpotifyToken()

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

  return { getPlaylists }
}

export default useSpotifyApi
