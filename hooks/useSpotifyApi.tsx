import axios from "axios"
import { useCallback, useEffect, useMemo } from "react"
import { useRecoilValue } from "recoil"
import useSpotifyToken from "./useSpotifyToken"
import { spotifyAccessTokenAtom } from "@/atoms/spotifyAccessTokenAtom"
import { CheckboxListModalItem } from "@/types/CheckboxListModalItem"

const useSpotifyApi = () => {
  const accessToken = useRecoilValue(spotifyAccessTokenAtom)
  const { refreshAccessToken } = useSpotifyToken()

  const spotifyApi = useMemo(
    () =>
      axios.create({
        baseURL: "/spotify-api",
        headers: {
          ContentType: "application/json",
          Authorization: `Bearer ${accessToken?.token}`
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

        const offset = 60 // 単位: 秒 | アクセストークンのリフレッシュは期限を迎えるより少し前に行う
        /** accessTokenがundefined、もしくはoffsetを考慮した上でアクセストークンの有効期限を迎えた場合はリフレッシュトークンを用いてアクセストークンをリフレッシュする
         * accessTokenがundefinedになる例: Spotifyにログイン済みの状態で、新しくMixJuiceを開いた場合
         */
        const shouldRefreshAccessToken =
          typeof accessToken === "undefined" ||
          Number(accessToken.expiresAt) - offset < Math.floor(Date.now() / 1000)
        if (shouldRefreshAccessToken) {
          try {
            const newAccessToken = await refreshAccessToken()
            config.headers.Authorization = `Bearer ${newAccessToken}`
            return config
          } catch (e) {
            return Promise.reject(e)
          }
        }

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
