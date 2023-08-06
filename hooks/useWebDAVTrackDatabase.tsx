import { useCallback, useMemo } from "react"
import { WebDAVTrackDatabase } from "@/classes/TrackDatabase"
import { TrackWithPath } from "@/types/Track"

// WebDAVのトラック取得の際のキャッシュ戦略用のIndexedDBを使用するためのカスタムフック
const useWebDAVTrackDatabase = () => {
  const db = useMemo(() => new WebDAVTrackDatabase(), [])

  const isDatabaseExists = useCallback(async () => {
    const result = await db.tracks.count()
    return result > 0
  }, [db.tracks])

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

  const searchTracksByKeyword = useCallback(
    (keyword: string) => {
      // 検索をケースインセンシティブに行うため、キーワードを小文字に変換
      const lowerKeyword = keyword.toLowerCase()

      // Dexie の filter メソッドを使って、title、albumTitle、artist のいずれかに
      // キーワードに部分一致するトラックを取得
      const filteredTracks = db.tracks.filter(
        (track: TrackWithPath) =>
          track.title.toLowerCase().includes(lowerKeyword) ||
          track.albumTitle.toLowerCase().includes(lowerKeyword) ||
          track.artist.toLowerCase().includes(lowerKeyword)
      )

      // フィルターされたトラックを配列に変換して返す
      return filteredTracks.toArray()
    },
    [db.tracks]
  )

  return {
    isDatabaseExists,
    saveTrackInfo,
    isTrackInfoExists,
    getTrackInfo,
    searchTracksByKeyword
  } as const
}

export default useWebDAVTrackDatabase
