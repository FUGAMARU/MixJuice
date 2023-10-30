import { useCallback, useMemo } from "react"
import { WebDAVTrackDatabase } from "@/classes/TrackDatabase"
import { TrackWithPath } from "@/types/Track"
import { filterTracksByKeyword } from "@/utils/filterTracksByKeyword"

// WebDAVのトラック取得の際のキャッシュ戦略用のIndexedDBを使用するためのカスタムフック
const useWebDAVTrackDatabase = () => {
  const db = useMemo(() => new WebDAVTrackDatabase(), [])

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
    async (keyword: string) => {
      const trackWithPathArray = await db.tracks.toArray()
      return filterTracksByKeyword(trackWithPathArray, keyword)
    },
    [db.tracks]
  )

  return {
    saveTrackInfo,
    isTrackInfoExists,
    getTrackInfo,
    searchTracks
  } as const
}

export default useWebDAVTrackDatabase
