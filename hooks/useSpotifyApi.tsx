import axios from "axios"
import { useCallback, useEffect } from "react"
import { useRecoilValue } from "recoil"
import useSpotifyToken from "./useSpotifyToken"
import { spotifyAccessTokenAtom } from "@/atoms/spotifyAccessTokenAtom"
import {
  SpotifyApiPlaylistTracksResponse,
  SpotifyApiTrackSearchResponse,
  SpotifyTrack
} from "@/types/SpotifyApiResponse"
import { extractOffsetValue } from "@/utils/extractOffsetValue"

export const spotifyApi = axios.create({
  baseURL: "/spotify-api",
  headers: {
    ContentType: "application/json"
  },
  responseType: "json"
})

let isNowRefreshingToken = false

type Props = {
  initialize: boolean
}

const useSpotifyApi = ({ initialize }: Props) => {
  const accessToken = useRecoilValue(spotifyAccessTokenAtom)
  const { refreshAccessToken, hasValidAccessTokenState } = useSpotifyToken({
    initialize: false
  })

  useEffect(() => {
    if (!initialize) return

    /** リクエストインターセプター */
    const requestInterceptor = spotifyApi.interceptors.request.use(
      async config => {
        /** リクエスト送信前処理 */

        /** アクセストークンの更新済みフラグの連携がうまくいなかった場合に連続でアクセストークンの更新作業が行われないようにするための緩衝材 */
        while (isNowRefreshingToken) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        /** accessTokenがundefined、もしくはoffsetを考慮した上でアクセストークンの有効期限を迎えた場合はリフレッシュトークンを用いてアクセストークンをリフレッシュする
         * accessTokenがundefinedになる例: Spotifyにログイン済みの状態で、新しくMixJuiceを開いた場合
         */
        if (!hasValidAccessTokenState()) {
          try {
            isNowRefreshingToken = true
            const newAccessToken = await refreshAccessToken()
            config.headers.Authorization = `Bearer ${newAccessToken}`
            return config
          } catch (e) {
            return Promise.reject(e)
          } finally {
            isNowRefreshingToken = false
          }
        }

        config.headers.Authorization = `Bearer ${accessToken!.token}` // hasValidAccessTokenState()によりaccessTokenがundefinedではないことが保証されている
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
    const responseInterceptor = spotifyApi.interceptors.response.use(
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

    return () => {
      spotifyApi.interceptors.request.eject(requestInterceptor)
      spotifyApi.interceptors.response.eject(responseInterceptor)
    }
  }, [accessToken, refreshAccessToken, hasValidAccessTokenState, initialize])

  /**
   * ログイン中ユーザーのプレイリスト一覧を取得する
   * https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists
   */
  const getPlaylists = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let playlists: any[] = [] // APIレスポンスの項目が多く型定義が面倒なのでanyを使用

    try {
      while (true) {
        const res = await spotifyApi.get("/me/playlists", {
          params: {
            limit: 50,
            offset: playlists.length
          }
        })

        playlists = [...playlists, ...res.data.items]

        if (res.data.next === null) break
      }
    } catch (e) {
      // e.messageにはAxiosのエラーメッセージが入っているのでsetErrorModalInstanceは行わない
      console.log("🟥ERROR: ", e)
      throw Error("プレイリストの取得に失敗しました")
    }

    return playlists
  }, [])

  /**
   * プレイリストのトラック一覧を取得する
   * https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks
   */
  const getPlaylistTracks = useCallback(async (playlistId: string) => {
    let tracks: SpotifyTrack[] = []

    try {
      while (true) {
        const res = await spotifyApi.get<SpotifyApiPlaylistTracksResponse>(
          `/playlists/${playlistId}/tracks`,
          {
            params: {
              limit: 50,
              offset: tracks.length,
              market: "JP",
              fields:
                "next, items(track(album(name,images),artists(name),name,id,uri,duration_ms))" // nextの指定を忘れると無限ループになってしまう
            }
          }
        )

        const obj = res.data.items
          .filter(
            item => !item.track.uri.includes("spotify:local") // ローカルファイルは除外 | 参考: https://developer.spotify.com/documentation/web-api/concepts/playlists
          )
          .map(item => item.track)

        tracks = [...tracks, ...obj]

        if (res.data.next === null) break
      }
    } catch (e) {
      // e.messageにはAxiosのエラーメッセージが入っているのでsetErrorModalInstanceは行わない
      console.log("🟥ERROR: ", e)
      throw Error("プレイリストに存在する楽曲の取得に失敗しました")
    }

    return tracks
  }, [])

  /**
   * トラックの再生を開始する
   * https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback
   */
  const startPlayback = useCallback(
    async (deviceId: string, trackId: string) => {
      try {
        await spotifyApi.put(
          "/me/player/play",
          {
            uris: [`spotify:track:${trackId}`]
          },
          {
            params: {
              device_id: deviceId
            }
          }
        )
      } catch (e) {
        // e.messageにはAxiosのエラーメッセージが入っているのでsetErrorModalInstanceは行わない
        console.log("🟥ERROR: ", e)
        throw Error("トラックの再生開始に失敗しました")
      }
    },
    []
  )

  /**
   * 楽曲をキーワード検索する
   * https://developer.spotify.com/documentation/web-api/reference/search
   */
  const searchTracks = useCallback(async (query: string, offset: number) => {
    try {
      const res = await spotifyApi.get<SpotifyApiTrackSearchResponse>(
        "/search",
        {
          params: {
            q: query,
            type: "track",
            market: "JP",
            limit: 5,
            offset
          }
        }
      )

      return {
        data: res.data.tracks.items,
        nextOffset: res.data.tracks.next
          ? extractOffsetValue(res.data.tracks.next)
          : undefined
      }
    } catch (e) {
      // e.messageにはAxiosのエラーメッセージが入っているのでsetErrorModalInstanceは行わない
      console.log("🟥ERROR: ", e)
      throw Error("楽曲の検索に失敗しました")
    }
  }, [])

  return {
    getPlaylists,
    getPlaylistTracks,
    startPlayback,
    searchTracks
  } as const
}

export default useSpotifyApi
