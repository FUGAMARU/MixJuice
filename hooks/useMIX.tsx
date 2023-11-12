import { useLocalStorage } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { useCallback, useMemo } from "react"
import useErrorModal from "./useErrorModal"
import useSpotifyApi from "./useSpotifyApi"
import useWebDAVServer from "./useWebDAVServer"
import useWebDAVTrackDatabase from "./useWebDAVTrackDatabase"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { DEFAULT_SETTING_VALUES } from "@/constants/Settings"
import { SettingValues } from "@/types/DefaultSettings"
import { NavbarItem } from "@/types/NavbarItem"
import {
  Track,
  TrackWithPath,
  formatFromSpotifyTrack,
  removePathProperty
} from "@/types/Track"
import { shuffleArray } from "@/utils/shuffleArray"

let webDAVTrackInfoCachingProgress = 0

const useMIX = () => {
  const [settings] = useLocalStorage<SettingValues>({
    key: LOCAL_STORAGE_KEYS.SETTINGS,
    defaultValue: DEFAULT_SETTING_VALUES
  })

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

  const baseObjForNotification = useMemo(
    () => ({
      id: "generating-track-caches",
      withCloseButton: true,
      title: "楽曲情報のキャッシュを作成中…",
      color: "webdav",
      loading: true,
      autoClose: false
    }),
    []
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

      const flattenFoldersTracks = await Promise.all(
        foldersTracks.flat().map(async trackFile => {
          const isKnown = await isTrackInfoExists(trackFile.filename)
          return { trackFile, isKnown }
        })
      )

      /** まずは未キャッシュの楽曲があればそれを先にキャッシュしてしまう */
      const unCachedTracks = flattenFoldersTracks
        .filter(({ isKnown }) => !isKnown)
        .map(({ trackFile }) => trackFile)

      if (unCachedTracks.length > 0) {
        notifications.show({
          ...baseObjForNotification,
          message: `楽曲情報のキャッシュが存在しないため楽曲情報のキャッシュを作成します。再生開始までしばらく時間がかかる場合があります。(${webDAVTrackInfoCachingProgress}/${unCachedTracks.length})`
        })

        for (const unCachedTrackFile of unCachedTracks) {
          const trackInfo = await getWebDAVServerTrackInfo(unCachedTrackFile)
          await saveTrackInfo(trackInfo)
          webDAVTrackInfoCachingProgress++
          notifications.update({
            ...baseObjForNotification,
            message: `楽曲情報のキャッシュが存在しないため楽曲情報のキャッシュを作成します。再生開始までしばらく時間がかかる場合があります。(${webDAVTrackInfoCachingProgress}/${unCachedTracks.length})`
          })
        }

        notifications.clean()
        webDAVTrackInfoCachingProgress = 0
      }

      /** ↓英単語のInformationにsをつけるのは誤りだが便宜上付ける */
      const tracksInformations = (await Promise.all(
        flattenFoldersTracks.map(({ trackFile }) =>
          getIndexedDBTrackInfo(trackFile.filename)
        )
      )) as TrackWithPath[] // 未キャッシュ楽曲は先にキャッシュしているので、配列にundefinedが含まれることはない

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
      showError,
      baseObjForNotification
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
      if (webdavFolderTracks.length > 0)
        baseTracks = [...baseTracks, ...webdavFolderTracks]

      if (settings.REMOVE_DUPLICATES_ON_MIX) {
        const uniqueTracks = baseTracks.filter(
          (track, index, self) =>
            self.findIndex(t => t.id === track.id) === index
        )
        baseTracks = uniqueTracks
      }

      return shuffleArray(baseTracks)
    },
    [getSpotifyPlaylistTracks, getWebDAVFolderTracks, settings]
  )

  return { mixAllTracks } as const
}

export default useMIX
