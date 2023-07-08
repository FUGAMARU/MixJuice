import { useCallback } from "react"
import { spotifyApi } from "@/app/components/layout/providers/Startup"
import { CheckboxListModalItem } from "@/types/CheckboxListModalItem"
import { MusicListItem } from "@/types/MusicListItem"
import { SpotifyApiTrack } from "@/types/SpotifyApiTrack"

const useSpotifyApi = () => {
  /**
   * ログイン中ユーザーのプレイリスト一覧を取得する
   * https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists
   */
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
    } catch (e) {
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
    let tracks: MusicListItem[] = []

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

        const obj: MusicListItem[] = res.data.items
          .filter(
            (item: SpotifyApiTrack) => !item.track.uri.includes("spotify:local") // ローカルファイルは除外 | 参考: https://developer.spotify.com/documentation/web-api/concepts/playlists
          )
          .map((item: SpotifyApiTrack) => ({
            id: item.track.id,
            title: item.track.name,
            artist: item.track.artists.map(artist => artist.name).join("・"),
            imgSrc: item.track.album.images[0].url
          }))

        tracks = [...tracks, ...obj]

        if (res.data.next === null) break
      }
    } catch (e) {
      console.log("🟥ERROR: ", e)
      throw Error("プレイリストに存在する楽曲の取得に失敗しました")
    }

    return tracks
  }, [])

  return { getPlaylists, getPlaylistTracks }
}

export default useSpotifyApi
