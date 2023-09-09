import { notifications } from "@mantine/notifications"
import { useCallback } from "react"
import { useSetRecoilState } from "recoil"
import useSpotifyApi from "./useSpotifyApi"
import useWebDAVServer from "./useWebDAVServer"
import useWebDAVTrackDatabase from "./useWebDAVTrackDatabase"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { NavbarItem } from "@/types/NavbarItem"
import { Track, TrackWithPath, formatFromSpotifyTrack } from "@/types/Track"
import { shuffleArray } from "@/utils/shuffleArray"

let hasDisplayedNotification = false

const useMIX = () => {
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const { getPlaylistTracks } = useSpotifyApi({ initialize: false })
  const {
    getFolderTracks,
    getTrackInfo: getWebDAVServerTrackInfo,
    checkIsFolderExists,
    checkAuth
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
        setErrorModalInstance(prev => [
          ...prev,
          new Error(
            "存在しないSpotifyプレイリストがMIXの対象に含まれていました。当該プレイリストのMIXはスキップされます。"
          )
        ])

      return tracksForPlaylists.flat()
    },
    [getPlaylistTracks, setErrorModalInstance]
  )

  const getWebDAVFolderTracks = useCallback(
    async (folderPaths: NavbarItem[]) => {
      try {
        const address = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_ADDRESS)
        const username = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_USER)
        const password = localStorage.getItem(
          LOCAL_STORAGE_KEYS.WEBDAV_PASSWORD
        )

        if (!address || !username || !password)
          throw new Error("WebDAVサーバーの認証情報が存在しません")

        await checkAuth(address, username, password)

        /** フォルダーが現存するか確認する */
        const availableFolderPaths: NavbarItem[] = []
        for (const folderPath of folderPaths) {
          const isFolderExists = await checkIsFolderExists(folderPath.id)
          if (isFolderExists) availableFolderPaths.push(folderPath)
        }

        if (folderPaths.length !== availableFolderPaths.length)
          setErrorModalInstance(prev => [
            ...prev,
            new Error(
              "存在しないWebDAVフォルダーがMIXの対象に含まれていました。当該フォルダーのMIXはスキップされます。"
            )
          ])

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
      setErrorModalInstance,
      checkIsFolderExists,
      checkAuth
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
