import { useCallback } from "react"
import { useSetRecoilState } from "recoil"
import { spotifyApi } from "@/app/components/layout/providers/SpotifyDaemon"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { SpotifyApiTrack } from "@/types/SpotifyApiTrack"

const useSpotifyApi = () => {
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)

  /**
   * ログイン中ユーザーのプレイリスト一覧を取得する
   * https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists
   */
  const getPlaylists = useCallback(async () => {
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
      console.log("🟥ERROR: ", e)
      setErrorModalInstance(prev => [...prev, e])

      throw Error("プレイリストの取得に失敗しました")
    }

    return playlists
  }, [setErrorModalInstance])

  /**
   * プレイリストのトラック一覧を取得する
   * https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks
   */
  const getPlaylistTracks = useCallback(
    async (playlistId: string) => {
      let tracks: SpotifyApiTrack[] = []

      try {
        while (true) {
          const res = await spotifyApi.get(`/playlists/${playlistId}/tracks`, {
            params: {
              limit: 50,
              offset: tracks.length,
              market: "JP",
              fields:
                "next, items(track(album(images),artists(name),name,id,uri))" // nextの指定を忘れると無限ループになってしまう
            }
          })

          const obj: SpotifyApiTrack[] = res.data.items.filter(
            (item: SpotifyApiTrack) => !item.track.uri.includes("spotify:local") // ローカルファイルは除外 | 参考: https://developer.spotify.com/documentation/web-api/concepts/playlists
          )

          tracks = [...tracks, ...obj]

          if (res.data.next === null) break
        }
      } catch (e) {
        console.log("🟥ERROR: ", e)
        setErrorModalInstance(prev => [...prev, e])

        throw Error("プレイリストに存在する楽曲の取得に失敗しました")
      }

      return tracks
    },
    [setErrorModalInstance]
  )

  return { getPlaylists, getPlaylistTracks }
}

export default useSpotifyApi
