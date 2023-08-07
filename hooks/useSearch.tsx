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

        const spotifySearchPromise = isSpotifyAuthorized
          ? searchSpotifyTracks(input, spotifySearchNextOffset)
          : Promise.resolve({ data: [], nextOffset: 0 })

        const webDAVTrackDatabaseSearchPromise = isWebDAVAuthorized
          ? searchWebDAVTrackDatabase(input)
          : Promise.resolve([])

        const folderPaths = localStorage.getItem(
          LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS
        )
        const webDAVTracksSearchPromise =
          isWebDAVAuthorized && folderPaths
            ? searchWebDAVTracks(JSON.parse(folderPaths), input)
            : Promise.resolve([])

        try {
          const [spotifyRes, webDAVTrackDatabaseRes, webDAVRes] =
            await Promise.all([
              spotifySearchPromise,
              webDAVTrackDatabaseSearchPromise,
              webDAVTracksSearchPromise
            ])

          setSpotifySearchResult(spotifyRes.data)
          setSpotifySearchNextOffset(spotifyRes.nextOffset)

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
