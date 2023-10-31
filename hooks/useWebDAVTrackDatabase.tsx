import { useCallback, useMemo } from "react"
import { useRecoilValue } from "recoil"
import { userDataAtom } from "@/atoms/userDataAtom"
import { WebDAVTrackDatabase } from "@/classes/TrackDatabase"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { TrackWithPath } from "@/types/Track"
import { WebDAVServerCredentials } from "@/types/WebDAVServerCredentials"
import { filterTracksByKeyword } from "@/utils/filterTracksByKeyword"
import { isDefined } from "@/utils/isDefined"
import {
  replaceBasicAuthCredentialsToString,
  replaceStringToBasicAuthCredentials
} from "@/utils/replaceBasicAuthCredentials"

// WebDAVのトラック取得の際のキャッシュ戦略用のIndexedDBを使用するためのカスタムフック
const useWebDAVTrackDatabase = () => {
  const db = useMemo(() => new WebDAVTrackDatabase(), [])
  const userData = useRecoilValue(userDataAtom)

  const restoreServerCredentials = useCallback(
    (trackInfo: TrackWithPath) => {
      if (!isDefined(userData)) return undefined

      const firestoreData =
        userData[FIRESTORE_DOCUMENT_KEYS.WEBDAV_SERVER_CREDENTIALS]
      if (!isDefined(firestoreData)) return undefined

      const serverCredentials: WebDAVServerCredentials =
        JSON.parse(firestoreData)
      const { address, user, password } = serverCredentials

      return {
        ...trackInfo,
        id: replaceStringToBasicAuthCredentials(
          trackInfo.id,
          address,
          user,
          password
        )
      }
    },
    [userData]
  )

  const saveTrackInfo = useCallback(
    async (trackInfo: TrackWithPath) => {
      await db.tracks.put({
        ...trackInfo,
        id: replaceBasicAuthCredentialsToString(trackInfo.id)
      })
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
      const trackInfo = await db.tracks.where("path").equals(path).first()
      return trackInfo ? restoreServerCredentials(trackInfo) : undefined
    },
    [db.tracks, restoreServerCredentials]
  )

  const searchTracks = useCallback(
    async (keyword: string) => {
      const trackWithPathArray = await db.tracks.toArray()
      const filteredTracks = filterTracksByKeyword(trackWithPathArray, keyword)
      const restoredFilteredTracks = filteredTracks.map(
        restoreServerCredentials
      )
      return restoredFilteredTracks.filter(isDefined)
    },
    [db.tracks, restoreServerCredentials]
  )

  return {
    saveTrackInfo,
    isTrackInfoExists,
    getTrackInfo,
    searchTracks
  } as const
}

export default useWebDAVTrackDatabase
