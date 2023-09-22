import { useCallback, useState } from "react"
import useWebDAVServer from "./useWebDAVServer"
import useWebDAVTrackDatabase from "./useWebDAVTrackDatabase"
import { MergedWebDAVSearchResult } from "@/types/MergedWebDAVSearchResult"
import { removePathProperty } from "@/types/Track"

const useMergedWebDAVServerData = () => {
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

      const indexedDBTracks = (await searchTracks(keyword)).filter(track =>
        folderPaths.some(folderPath => track.path.startsWith(folderPath))
      )
      setMergedSearchResult({
        status: "SEARCHING_WEBDAV_SERVER",
        data: indexedDBTracks.map(track => removePathProperty(track))
      })

      const folderTracks = await Promise.all(
        folderPaths.map(folderPath => getFolderTracks(folderPath, keyword))
      )
      const filteredFolderTracks = folderTracks
        .flat()
        .filter(
          track =>
            !indexedDBTracks.map(track => track.path).includes(track.filename)
        )
      const folderTracksInfo = await Promise.all(
        filteredFolderTracks.map(async fileInfo => {
          const trackInfo = await getTrackInfo(fileInfo)
          saveTrackInfo(trackInfo)
          return trackInfo
        })
      )

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
    [searchTracks, getFolderTracks, getTrackInfo, saveTrackInfo]
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
