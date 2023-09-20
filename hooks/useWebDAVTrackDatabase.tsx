import { useCallback, useMemo, useState } from "react"
import useWebDAVServer from "./useWebDAVServer"
import { WebDAVTrackDatabase } from "@/classes/TrackDatabase"
import { MergedWebDAVSearchResult } from "@/types/MergedWebDAVSearchResult"
import { TrackWithPath, removePathProperty } from "@/types/Track"

// WebDAVのトラック取得の際のキャッシュ戦略用のIndexedDBを使用するためのカスタムフック
const useWebDAVTrackDatabase = () => {
  const db = useMemo(() => new WebDAVTrackDatabase(), [])
  const { searchTracksExcept } = useWebDAVServer()
  const [mergedSearchResult, setMergedSearchResult] =
    useState<MergedWebDAVSearchResult>({
      status: "IDLE",
      data: []
    }) // Indexed DBとWebDAVサーバー上の楽曲の検索結果をマージしたもの

  const saveTrackInfo = useCallback(
    async (trackInfo: TrackWithPath) => {
      await db.tracks.put(trackInfo)
    },
    [db.tracks]
  )

  const isTrackInfoExists = useCallback(
    async (path: string) => {
      const result = await db.tracks.where("path").equals(path).first()
      return !!result
    },
    [db.tracks]
  )

  const getTrackInfo = useCallback(
    async (path: string) => {
      return await db.tracks.where("path").equals(path).first()
    },
    [db.tracks]
  )

  const searchTracks = useCallback(
    (keyword: string) => {
      const lowerKeyword = keyword.toLowerCase()

      const filteredTracks = db.tracks.filter(
        (track: TrackWithPath) =>
          track.title.toLowerCase().includes(lowerKeyword) ||
          track.albumTitle.toLowerCase().includes(lowerKeyword) ||
          track.artist.toLowerCase().includes(lowerKeyword)
      )

      return filteredTracks.toArray()
    },
    [db.tracks]
  )

  /** 最初はIndexed DBからのみ楽曲を検索するが、Indexed DBにキャッシュされていない楽曲がWebDAVサーバー上に存在した場合は、それぞれの結果をマージしたものを返す */
  const searchTracksWithOriginalSource = useCallback(
    async (folderPath: string, keyword: string) => {
      setMergedSearchResult({
        status: "SEARCHING_INDEXED_DB",
        data: []
      })

      const indexedDBTracks = (await searchTracks(keyword)).filter(track =>
        track.path.startsWith(folderPath)
      )
      setMergedSearchResult({
        status: "SEARCHING_WEBDAV_SERVER",
        data: indexedDBTracks.map(track => removePathProperty(track))
      })

      const webDAVTracks = await searchTracksExcept(
        [folderPath],
        indexedDBTracks.map(track => track.path)
      )
      webDAVTracks.map(track => saveTrackInfo(track))

      // indexedDBの検索結果とwebDAVサーバーの検索結果を結合して、楽曲タイトルの昇順にソートする
      const mergedTracks = indexedDBTracks
        .concat(webDAVTracks)
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
    [searchTracksExcept, searchTracks, saveTrackInfo]
  )

  return {
    saveTrackInfo,
    isTrackInfoExists,
    getTrackInfo,
    searchTracks,
    searchTracksWithOriginalSource,
    mergedSearchResult,
    setMergedSearchResult
  } as const
}

export default useWebDAVTrackDatabase
