import { notifications } from "@mantine/notifications"
import { useCallback } from "react"
import useSpotifyApi from "./useSpotifyApi"
import useSpotifyToken from "./useSpotifyToken"
import useWebDAVApi from "./useWebDAVApi"
import useWebDAVTrackDatabase from "./useWebDAVTrackDatabase"
import { NavbarItem } from "@/types/NavbarItem"
import { SpotifyApiTrack } from "@/types/SpotifyApiTrack"
import { Track, TrackWithPath } from "@/types/Track"
import { shuffleArray } from "@/utils/shuffleArray"

const useMIX = () => {
  const { hasValidAccessTokenState } = useSpotifyToken()
  const { getPlaylistTracks } = useSpotifyApi({ initialize: false })
  const { getFolderTracks, getFolderTrackInfo } = useWebDAVApi({
    initialize: false
  })
  const { isDatabaseExists, saveTrackInfo, isTrackInfoExists, getTrackInfo } =
    useWebDAVTrackDatabase()

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
          image: {
            src: item.track.album.images[0].url,
            height: item.track.album.images[0].height,
            width: item.track.album.images[0].width
          },
          duration: item.track.duration_ms
        }))
      }

      const selectedPlaylists = playlists.filter(p => p.checked === true)

      if (hasValidAccessTokenState()) {
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
    async (folderPaths: NavbarItem[]) => {
      if (!(await isDatabaseExists())) {
        notifications.show({
          withCloseButton: true,
          title: "楽曲情報のキャッシュを作成中…",
          message:
            "楽曲情報のキャッシュが存在しないため楽曲情報のキャッシュを作成します。再生開始までしばらく時間がかかる場合があります。(WebDAVサーバーが同一ネットワーク上にある場合、キャッシングに1曲あたりおよそ1秒を要します。)",
          color: "webdav",
          loading: true,
          autoClose: false
        })
      }

      const foldersTracks = await Promise.all(
        folderPaths.map(async folderPath => {
          return await getFolderTracks(folderPath.id)
        })
      )

      /** どのフォルダーにも楽曲ファイルが存在しない場合 */
      if (foldersTracks.every(folderTracks => folderTracks.length === 0))
        return []

      /** 以下、「Object.filename」はそのファイルのフルパスを表す */

      const flattenFoldersTracks = foldersTracks.flat()

      const whetherKnow = await Promise.all(
        flattenFoldersTracks.map(async trackFile => {
          return await isTrackInfoExists(trackFile.filename)
        })
      )

      const unknownTracks = whetherKnow.filter(isKnown => !isKnown)
      const newlyKnownTracksInfo =
        unknownTracks.length > 0
          ? await getFolderTrackInfo(
              unknownTracks.map((_, idx) => flattenFoldersTracks[idx])
            )
          : []

      if (newlyKnownTracksInfo.length > 0) {
        await Promise.all(
          newlyKnownTracksInfo.map(async trackInfo => {
            await saveTrackInfo(trackInfo)
          })
        )
      }

      const knewTracks = whetherKnow.filter(isKnown => isKnown)
      const knewTracksInfo: TrackWithPath[] =
        knewTracks.length > 0
          ? await Promise.all(
              knewTracks.map(
                async (_, idx) =>
                  (await getTrackInfo(
                    flattenFoldersTracks[idx].filename
                  )) as TrackWithPath // isTrackInfoExistsによるチェックを挟んでいるのでundefinedでないことが保証されている
              )
            )
          : []

      return newlyKnownTracksInfo.concat(knewTracksInfo).map(
        // pathプロパティーはこの先使わないので削除する
        // eslint-disable-next-line unused-imports/no-unused-vars
        ({ path, ...rest }) => rest
      ) as Track[]
    },
    [
      isDatabaseExists,
      getFolderTrackInfo,
      getTrackInfo,
      getFolderTracks,
      isTrackInfoExists,
      saveTrackInfo
    ]
  )

  const mixAllTracks = useCallback(
    async (spotifyPlaylists: NavbarItem[], webDAVFolders: NavbarItem[]) => {
      const spotifyTracksPromise =
        spotifyPlaylists.length > 0
          ? getSpotifyPlaylistTracks(spotifyPlaylists)
          : Promise.resolve([])

      const webdavTracksPromise =
        webDAVFolders.length > 0
          ? getWebDAVFolderTracks(webDAVFolders)
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

      notifications.clean()

      return shuffleArray(baseTracks)
    },
    [getSpotifyPlaylistTracks, getWebDAVFolderTracks]
  )

  return { mixAllTracks } as const
}

export default useMIX
