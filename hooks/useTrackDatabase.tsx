import { useCallback, useMemo } from "react"
import { TrackDatabase } from "@/classes/TrackDatabase"
import { Track } from "@/types/Track"

// WebDAVのトラック取得の際のキャッシュ戦略用のIndexedDBを使用するためのカスタムフック
const useTrackDatabase = () => {
  const db = useMemo(() => new TrackDatabase(), [])

  const saveTrackInfo = useCallback(
    async (trackInfo: Track) => {
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
      const result = await db.tracks.where("path").equals(path).first()
      return result
    },
    [db.tracks]
  )

  return {
    saveTrackInfo,
    isTrackInfoExists,
    getTrackInfo
  } as const
}

export default useTrackDatabase
