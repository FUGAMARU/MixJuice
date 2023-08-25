import { notifications } from "@mantine/notifications"
import { useCallback } from "react"
import { useSetRecoilState } from "recoil"
import useSpotifyApi from "./useSpotifyApi"
import useSpotifyToken from "./useSpotifyToken"
import useWebDAVServer from "./useWebDAVServer"
import useWebDAVTrackDatabase from "./useWebDAVTrackDatabase"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { NavbarItem } from "@/types/NavbarItem"
import { Track, TrackWithPath, formatFromSpotifyTrack } from "@/types/Track"
import { shuffleArray } from "@/utils/shuffleArray"

let hasDisplayedNotification = false

const useMIX = () => {
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const { hasValidAccessTokenState } = useSpotifyToken({ initialize: false })
  const { getPlaylistTracks } = useSpotifyApi({ initialize: false })
  const { getFolderTracks, getTrackInfo: getWebDAVServerTrackInfo } =
    useWebDAVServer()
  const {
    saveTrackInfo,
    isTrackInfoExists,
    getTrackInfo: getIndexedDBTrackInfo
  } = useWebDAVTrackDatabase()

  const getSpotifyPlaylistTracks = useCallback(
    async (playlists: NavbarItem[]) => {
      let tracksForPlaylists: Track[][] = []

      const getPlaylistTracksAsync = async (
        playlistId: string
      ): Promise<Track[]> => {
        const res = await getPlaylistTracks(playlistId)
        return res.map(item => formatFromSpotifyTrack(item))
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
      try {
        const foldersTracks = await Promise.all(
          folderPaths.map(async folderPath => {
            return await getFolderTracks(folderPath.id, "")
          })
        )

        /** どのフォルダーにも楽曲ファイルが存在しない場合 */
        if (foldersTracks.every(folderTracks => folderTracks.length === 0))
          return []

        /** 以下、「Object.filename」はそのファイルのフルパスを表す */

        const flattenFoldersTracks = foldersTracks.flat()

        /** ↓英単語のInformationにsをつけるのは誤りだが便宜上付ける */
        const tracksInformations: TrackWithPath[] = []

        /** フォルダーに入っているトラックが多い状態で並列処理すると楽曲情報の取得が終了しないことがあるのでPromise.allは使わない */
        for (const trackFile of flattenFoldersTracks) {
          const isKnown = await isTrackInfoExists(trackFile.filename)

          let trackInfo

          if (isKnown) {
            trackInfo = (await getIndexedDBTrackInfo(
              trackFile.filename
            )) as TrackWithPath
          } else {
            if (!hasDisplayedNotification) {
              notifications.show({
                withCloseButton: true,
                title: "楽曲情報のキャッシュを作成中…",
                message:
                  "楽曲情報のキャッシュが存在しないため楽曲情報のキャッシュを作成します。再生開始までしばらく時間がかかる場合があります。(WebDAVサーバーが同一ネットワーク上にある場合、キャッシングに1曲あたりおよそ1.5秒を要します。)",
                color: "webdav",
                loading: true,
                autoClose: false
              })
              hasDisplayedNotification = true
            }

            trackInfo = await getWebDAVServerTrackInfo(trackFile)
            await saveTrackInfo(trackInfo)
          }

          tracksInformations.push(trackInfo)
        }

        hasDisplayedNotification = false

        return tracksInformations.map(
          // pathプロパティーはこの先使わないので削除する
          // eslint-disable-next-line unused-imports/no-unused-vars
          ({ path, ...rest }) => rest
        ) as Track[]
      } catch (e) {
        setErrorModalInstance(prev => [...prev, e])
      }
    },
    [
      getIndexedDBTrackInfo,
      getFolderTracks,
      isTrackInfoExists,
      saveTrackInfo,
      getWebDAVServerTrackInfo,
      setErrorModalInstance
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
