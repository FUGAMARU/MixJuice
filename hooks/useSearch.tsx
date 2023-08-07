import { useState, useCallback, useEffect } from "react"
import { useSetRecoilState } from "recoil"
import useSpotifyApi from "./useSpotifyApi"
import useWebDAVApi from "./useWebDAVApi"
import useWebDAVTrackDatabase from "./useWebDAVTrackDatabase"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { ListItemDetail } from "@/types/ListItemDetail"
import { SpotifyApiTrack } from "@/types/SpotifyApiTrack"

let timer: NodeJS.Timer

const useSearch = () => {
  const [keyword, setKeyword] = useState("")

  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const [isSearching, setIsSearching] = useState(false)
  const { searchTracks: searchWebDAVTrackDatabase } = useWebDAVTrackDatabase()
  const { searchTracks: searchWebDAVTracks } = useWebDAVApi({
    initialize: false
  })
  const { searchTracks: searchSpotifyTracks } = useSpotifyApi({
    initialize: false
  })

  const [isSpotifyAuthorized, setIsSpotifyAuthorized] = useState(false)
  useEffect(() => {
    setIsSpotifyAuthorized(
      localStorage.getItem(LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN) !== null
    )
  }, [])
  const [spotifySearchNextOffset, setSpotifySearchNextOffset] = useState(0)
  const [spotifySearchResult, setSpotifySearchResult] = useState<
    SpotifyApiTrack["track"][]
  >([])

  const [isWebDAVAuthorized, setIsWebDAVAuthorized] = useState(false)
  useEffect(() => {
    setIsWebDAVAuthorized(
      localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_IS_AUTHENTICATED) ===
        "true"
    )
  }, [])
  const [webDAVTrackDatabaseSearchResult, setWebDAVTrackDatabaseSearchResult] =
    useState<ListItemDetail[]>([]) // WebDAV (IndexedDBに楽曲情報をキャッシュ済み)
  const [webDAVSearchResult, setWebDAVSearchResult] = useState<
    ListItemDetail[]
  >([]) // WebDAV (IndexedDBに楽曲情報のキャッシュ無し)

  const handleKeywordChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      setKeyword(input)
      setSpotifySearchNextOffset(0)

      if (!input) {
        setSpotifySearchResult([])
        return
      }

      if (timer) clearTimeout(timer)

      /** 検索窓に文字が入力されてから500ミリ秒後にAPIを叩く (入力された瞬間にAPIを叩くとリクエスト過多になる) */
      timer = setTimeout(async () => {
        setIsSearching(true)

        const spotifyPromise = new Promise<{
          data: []
          nextOffset: number
        } | void>(async resolve => {
          if (!isSpotifyAuthorized) {
            resolve({ data: [], nextOffset: 0 })
          }
          const spotifyRes = await searchSpotifyTracks(
            input,
            spotifySearchNextOffset
          )
          setSpotifySearchResult(spotifyRes.data)
          setSpotifySearchNextOffset(spotifyRes.nextOffset)
          resolve()
        })

        const webDAVTrackDatabasePromise = new Promise<[] | void>(
          async resolve => {
            if (!isWebDAVAuthorized) {
              resolve([])
            }

            const webDAVTrackDatabaseRes = await searchWebDAVTrackDatabase(
              input
            )
            setWebDAVTrackDatabaseSearchResult(
              webDAVTrackDatabaseRes.map(track => {
                return {
                  id: track.id,
                  image: track.image,
                  title: track.title,
                  caption: track.artist
                }
              })
            )
            resolve()
          }
        )

        const webDAVPromise = new Promise<[] | void>(async resolve => {
          const folderPaths = localStorage.getItem(
            LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS
          )

          if (!isWebDAVAuthorized || !folderPaths) {
            resolve([])
          }

          const webDAVRes = await searchWebDAVTracks(
            JSON.parse(folderPaths!),
            input
          )
          setWebDAVSearchResult(
            webDAVRes.map(track => {
              return {
                id: track.id,
                image: track.image,
                title: track.title,
                caption: track.artist
              }
            })
          )
          resolve()
        })

        try {
          await Promise.all([
            spotifyPromise,
            webDAVTrackDatabasePromise,
            webDAVPromise
          ])
        } catch (e) {
          setErrorModalInstance(prev => [...prev, e])
        } finally {
          setIsSearching(false)
        }
      }, 500)
    },
    [
      isSpotifyAuthorized,
      searchSpotifyTracks,
      setErrorModalInstance,
      spotifySearchNextOffset,
      isWebDAVAuthorized,
      searchWebDAVTrackDatabase,
      searchWebDAVTracks
    ]
  )

  const showMoreSpotifySearchResult = useCallback(async () => {
    try {
      const res = await searchSpotifyTracks(keyword, spotifySearchNextOffset)
      setSpotifySearchResult(prev => [...prev, ...res.data])
      setSpotifySearchNextOffset(res.nextOffset)
    } catch (e) {
      setErrorModalInstance(prev => [...prev, e])
    }
  }, [
    keyword,
    searchSpotifyTracks,
    setErrorModalInstance,
    spotifySearchNextOffset
  ])

  return {
    keyword,
    handleKeywordChange,
    isSpotifyAuthorized,
    isWebDAVAuthorized,
    spotifySearchResult,
    webDAVTrackDatabaseSearchResult,
    showMoreSpotifySearchResult,
    isSearching,
    webDAVSearchResult
  } as const
}

export default useSearch
