import { notifications } from "@mantine/notifications"
import { useCallback } from "react"
import useErrorModal from "./useErrorModal"
import useSpotifyApi from "./useSpotifyApi"
import useWebDAVServer from "./useWebDAVServer"
import useWebDAVTrackDatabase from "./useWebDAVTrackDatabase"
import { NavbarItem } from "@/types/NavbarItem"
import {
  Track,
  TrackWithPath,
  formatFromSpotifyTrack,
  removePathProperty
} from "@/types/Track"
import { shuffleArray } from "@/utils/shuffleArray"

let hasDisplayedNotification = false
let gettingWebDAVTrackInfoProgress = 0

const useMIX = () => {
  const { showError, showWarning } = useErrorModal()
  const { getPlaylistTracks } = useSpotifyApi({ initialize: false })
  const {
    checkServerConnectionRoutine,
    getFolderTracks,
    getTrackInfo: getWebDAVServerTrackInfo,
    checkIsFolderExists
  } = useWebDAVServer()
  const {
    saveTrackInfo,
    isTrackInfoExists,
    getTrackInfo: getIndexedDBTrackInfo
  } = useWebDAVTrackDatabase()

  const getSpotifyPlaylistTracks = useCallback(
    async (playlists: NavbarItem[]) => {
      const getPlaylistTracksAsync = async (
        playlistId: string
      ): Promise<Track[]> => {
        const res = await getPlaylistTracks(playlistId)
        return res.map(item => formatFromSpotifyTrack(item))
      }

      const tracksForPlaylists: Track[][] = []
      for (const playlist of playlists) {
        try {
          const playlistTracks = await getPlaylistTracksAsync(playlist.id)
          tracksForPlaylists.push(playlistTracks)
        } catch {
          // 例外が発生しても何もしなくてOK
        }
      }

      if (tracksForPlaylists.length !== playlists.length)
        /** TODO: Spotifyのプレイリストは削除しても90日経たないと完全削除されないため、Spotify上で削除してからすぐはこのエラーが発生しない
         * 2023年12月8日以降にプレイリストID「1INkxTlQ2KWyAC5413T72c」を使用してちゃんと動くか検証する必要がある
         */
        showWarning(
          "存在しないSpotifyプレイリストがMIXの対象に含まれていました。当該プレイリストのMIXはスキップされます。"
        )

      return tracksForPlaylists.flat()
    },
    [getPlaylistTracks, showWarning]
  )

  const getWebDAVFolderTracks = useCallback(
    async (folderPaths: NavbarItem[]) => {
      try {
        await checkServerConnectionRoutine()
      } catch (e) {
        showWarning("WebDAVサーバーのMIXはスキップされます")
        showError(e)
        return []
      }

      /** これより下はWebDAVサーバーに接続できる前提で処理が進むので、そもそもWebDAVサーバーに接続できるのかを上記のコードでチェックする
       * getFolderTracksなどの中でもcheckServerConnectionRoutineは実行されるが、MIX処理に関してはNavbarで選択されているWebDAVサーバーのフォルダーが実在しなくとも、それを例外として扱いたくないのでこのような実装にしている
       */

      /** フォルダーが現存するか確認する */
      const availableFolderPaths: NavbarItem[] = []
      for (const folderPath of folderPaths) {
        const isFolderExists = await checkIsFolderExists(folderPath.id)
        if (isFolderExists) availableFolderPaths.push(folderPath)
      }

      if (folderPaths.length !== availableFolderPaths.length)
        showWarning(
          "存在しないWebDAVフォルダーがMIXの対象に含まれていました。当該フォルダーのMIXはスキップされます。"
        )

      const foldersTracks = await Promise.all(
        availableFolderPaths.map(async folderPath => {
          return await getFolderTracks(folderPath.id, "")
        })
      )

      /** どのフォルダーにも楽曲ファイルが存在しない場合 */
      if (foldersTracks.every(folderTracks => folderTracks.length === 0))
        return []

      /** 以下、「Object.filename」はそのファイルのフルパスを表す */

      const flattenFoldersTracks = foldersTracks.flat()

      console.log(
        `🟦DEBUG: 全${flattenFoldersTracks.length}曲の楽曲情報をWebDAVサーバー及びIndexedDBから取得します`
      )

      /** ↓英単語のInformationにsをつけるのは誤りだが便宜上付ける */
      const tracksInformations: TrackWithPath[] = []

      /** フォルダーに入っているトラックが多い状態で並列処理すると楽曲情報の取得が終了しないことがあるのでPromise.allは使わない */
      for (const trackFile of flattenFoldersTracks) {
        const isKnown = await isTrackInfoExists(trackFile.filename)

        let trackInfo: TrackWithPath

        if (isKnown) {
          trackInfo = (await getIndexedDBTrackInfo(
            trackFile.filename
          )) as TrackWithPath
          gettingWebDAVTrackInfoProgress++
          console.log(
            `🟦DEBUG: IndexedDBから楽曲情報を取得しました (${gettingWebDAVTrackInfoProgress}/${flattenFoldersTracks.length})`
          )
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
          gettingWebDAVTrackInfoProgress++
          console.log(
            `🟦DEBUG: WebDAVサーバーから新たに楽曲情報を取得しました (${gettingWebDAVTrackInfoProgress}/${flattenFoldersTracks.length})`
          )
          await saveTrackInfo(trackInfo)
        }

        tracksInformations.push(trackInfo)
      }

      hasDisplayedNotification = false
      gettingWebDAVTrackInfoProgress = 0

      return tracksInformations.map(trackWithPath =>
        removePathProperty(trackWithPath)
      )
    },
    [
      getIndexedDBTrackInfo,
      getFolderTracks,
      isTrackInfoExists,
      saveTrackInfo,
      getWebDAVServerTrackInfo,
      showWarning,
      checkIsFolderExists,
      checkServerConnectionRoutine,
      showError
    ]
  )

  const mixAllTracks = useCallback(
    async (
      checkedSpotifyPlaylists: NavbarItem[],
      checkedWebDAVFolders: NavbarItem[]
    ) => {
      const spotifyTracksPromise =
        checkedSpotifyPlaylists.length > 0
          ? getSpotifyPlaylistTracks(checkedSpotifyPlaylists)
          : Promise.resolve([])

      const webdavTracksPromise =
        checkedWebDAVFolders.length > 0
          ? getWebDAVFolderTracks(checkedWebDAVFolders)
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
