import { useCallback } from "react"
import useSpotifyApi from "./useSpotifyApi"
import useSpotifyToken from "./useSpotifyToken"
import useWebDAVApi from "./useWebDAVApi"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { NavbarItem } from "@/types/NavbarItem"
import { SpotifyApiTrack } from "@/types/SpotifyApiTrack"
import { Track } from "@/types/Track"

const useMIX = () => {
  const { hasValidAccessTokenState } = useSpotifyToken()
  const { getPlaylistTracks } = useSpotifyApi({ initialize: false })
  const { getFolderTracks } = useWebDAVApi({ initialize: false })

  const getSpotifyPlaylistTracks = useCallback(
    async (playlists: NavbarItem[]) => {
      let tracksForPlaylists: Track[][] = []

      const getPlaylistTracksAsync = async (
        playlistId: string
      ): Promise<Track[]> => {
        const res = await getPlaylistTracks(playlistId)
        return res.map((item: SpotifyApiTrack) => ({
          id: item.track.id,
          provider: "spotify",
          title: item.track.name,
          albumTitle: item.track.album.name,
          artist: item.track.artists.map(artist => artist.name).join("・"),
          imgSrc: item.track.album.images[0].url,
          imgHeight: item.track.album.images[0].height,
          imgWidth: item.track.album.images[0].width,
          duration: item.track.duration_ms
        }))
      }

      const selectedPlaylists = playlists.filter(p => p.checked === true)

      if (hasValidAccessTokenState) {
        console.log("🟦DEBUG: 並列処理でプレイリストの情報を取得します")
        tracksForPlaylists = await Promise.all(
          selectedPlaylists.map(playlist => getPlaylistTracksAsync(playlist.id))
        )
      } else {
        /** アクセストークンがRecoilStateにセットされていない状態で並列処理でリクエストするとトークンの更新処理が何回も走ってしまうので逐次処理でリクエストを行う */
        console.log("🟦DEBUG: 逐次処理でプレイリストの情報を取得します")
        for (const playlist of selectedPlaylists) {
          const tracks = await getPlaylistTracksAsync(playlist.id)
          tracksForPlaylists.push(tracks)
        }
      }

      return tracksForPlaylists.flat()
    },
    [getPlaylistTracks, hasValidAccessTokenState]
  )

  const getWebDAVFolderTracks = useCallback(
    async (path: string) => {
      return await getFolderTracks(path)
    },
    [getFolderTracks]
  )

  const mixAllTracks = useCallback(
    async (spotifyPlaylists: NavbarItem[], webDAVFolders: NavbarItem[]) => {
      const spotifyTracksPromise =
        spotifyPlaylists.length > 0
          ? getSpotifyPlaylistTracks(spotifyPlaylists)
          : Promise.resolve([])

      const webdavTracksPromise =
        webDAVFolders.length > 0
          ? getWebDAVFolderTracks(
              localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATH)!
            )
          : Promise.resolve([])

      const [spotifyPlaylistTracks, webdavFolderTracks] = await Promise.all([
        spotifyTracksPromise,
        webdavTracksPromise
      ])

      let baseTracks: Track[] = []

      if (spotifyPlaylistTracks.length > 0)
        baseTracks = [...baseTracks, ...spotifyPlaylistTracks]
      if (webdavFolderTracks)
        baseTracks = [...baseTracks, ...webdavFolderTracks]

      return baseTracks
    },
    [getSpotifyPlaylistTracks, getWebDAVFolderTracks]
  )

  return { mixAllTracks } as const
}

export default useMIX
