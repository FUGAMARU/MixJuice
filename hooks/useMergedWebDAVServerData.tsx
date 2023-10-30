import { useLocalStorage } from "@mantine/hooks"
import { useCallback, useState } from "react"
import useWebDAVServer from "./useWebDAVServer"
import useWebDAVTrackDatabase from "./useWebDAVTrackDatabase"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { DEFAULT_SETTING_VALUES } from "@/constants/Settings"
import { SettingValues } from "@/types/DefaultSettings"
import { MergedWebDAVSearchResult } from "@/types/MergedWebDAVSearchResult"
import { removePathProperty } from "@/types/Track"
import { filterTracksByKeyword } from "@/utils/filterTracksByKeyword"

const useMergedWebDAVServerData = () => {
  const [settings] = useLocalStorage<SettingValues>({
    key: LOCAL_STORAGE_KEYS.SETTINGS,
    defaultValue: DEFAULT_SETTING_VALUES
  })
  const [mergedSearchResult, setMergedSearchResult] =
    useState<MergedWebDAVSearchResult>({
      status: "IDLE",
      data: []
    }) // Indexed DBとWebDAVサーバー上の楽曲の検索結果をマージしたもの

  const { getFolderTracks, getTrackInfo } = useWebDAVServer()
  const { searchTracks, saveTrackInfo } = useWebDAVTrackDatabase()

  /** 最初にIndexedDBにキャッシュされているデーターを用いて楽曲の検索を行うが、その後Indexed DBにキャッシュとして存在しなかった楽曲情報をWebDAVサーバーから引っ張ってきて、最終的にそれぞれのデーターをマージして返す
   * IndexedDBのデーターを用いた楽曲の検索の完了時、WebDAVサーバーから楽曲情報を取得した上での検索完了時と、それぞれの段階毎に検索結果を返したいので、関数の戻り値自体はvoid型にして、検索結果はuseStateで管理する
   */
  const searchAndMergeWebDAVMusicInfo = useCallback(
    async (folderPaths: string[], keyword: string) => {
      setMergedSearchResult({
        status: "SEARCHING_INDEXED_DB",
        data: []
      })

      /** IndexedDBにキャッシュ済みのメタデーターを検索 */
      const indexedDBTracks = (await searchTracks(keyword)).filter(track =>
        folderPaths.some(folderPath => track.path.startsWith(folderPath))
      )
      setMergedSearchResult({
        status: "SEARCHING_WEBDAV_SERVER",
        data: indexedDBTracks.map(track => removePathProperty(track))
      })

      /** WebDAVサーバー上にある楽曲を検索する時、ファイル名ではなくメタデータを対象に検索するかどうか */
      const shouldSearchAllMetadata =
        settings.SEARCH_ALL_METADATA_FOR_UNCACHED_WEBDAV_TRACK

      /** 検索対象となり得る楽曲の絶対パスを列挙する */
      const folderTracks = await Promise.all(
        folderPaths.map(folderPath =>
          getFolderTracks(folderPath, shouldSearchAllMetadata ? "" : keyword)
        )
      )

      /** IndexedDBに存在しない楽曲ファイルを抽出 */
      const filteredFolderTracks = folderTracks
        .flat()
        .filter(
          track =>
            !indexedDBTracks.map(track => track.path).includes(track.filename)
        )

      const keywordFilteredUnCachedTracks = await Promise.all(
        filteredFolderTracks.map(fileInfo => getTrackInfo(fileInfo))
      )

      const folderTracksInfo = shouldSearchAllMetadata
        ? filterTracksByKeyword(keywordFilteredUnCachedTracks, keyword)
        : keywordFilteredUnCachedTracks

      /** 新しく取得した楽曲のメタデーターをIndexedDBに保存しておく */
      folderTracksInfo.forEach(trackInfo => saveTrackInfo(trackInfo))

      // indexedDBの検索結果とwebDAVサーバーの検索結果を結合して、楽曲タイトルの昇順にソートする
      const mergedTracks = indexedDBTracks
        .concat(folderTracksInfo)
        .sort((a, b) => {
          if (a.title > b.title) return 1
          if (a.title < b.title) return -1
          return 0
        })
        .map(track => removePathProperty(track))

      setMergedSearchResult({
        status: "IDLE",
        data: mergedTracks
      })
    },
    [searchTracks, getFolderTracks, getTrackInfo, saveTrackInfo, settings]
  )

  const resetMergedSearchResult = useCallback(() => {
    setMergedSearchResult({
      status: "IDLE",
      data: []
    })
  }, [])

  return {
    searchAndMergeWebDAVMusicInfo,
    mergedSearchResult,
    resetMergedSearchResult
  } as const
}

export default useMergedWebDAVServerData
