import { useState, useCallback, useEffect } from "react"
import { useSetRecoilState } from "recoil"
import useSpotifyApi from "./useSpotifyApi"
import useWebDAVServer from "./useWebDAVServer"
import useWebDAVTrackDatabase from "./useWebDAVTrackDatabase"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { Track, formatFromSpotifyTrack } from "@/types/Track"

let timer: NodeJS.Timer

const useSearch = () => {
  const [keyword, setKeyword] = useState("")

  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const [isSearchingSpotify, setIsSearchingSpotify] = useState(false)
  const [isSearchingWebDAV, setIsSearchingWebDAV] = useState(false)
  const [isSearchingWebDAVTrackDatabase, setIsSearchingWebDAVTrackDatabase] =
    useState(false)
  const { searchTracks: searchWebDAVTrackDatabase } = useWebDAVTrackDatabase()
  const { searchTracks: searchWebDAVTracks } = useWebDAVServer()
  const { searchTracks: searchSpotifyTracks } = useSpotifyApi({
    initialize: false
  })

  const [isSpotifyAuthorized, setIsSpotifyAuthorized] = useState(false)
  useEffect(() => {
    setIsSpotifyAuthorized(
      localStorage.getItem(LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN) !== null
    )
  }, [])
  const [spotifySearchNextOffset, setSpotifySearchNextOffset] = useState<
    number | undefined
  >(0)
  const [spotifySearchResult, setSpotifySearchResult] = useState<Track[]>([])

  const [isWebDAVAuthorized, setIsWebDAVAuthorized] = useState(false)
  useEffect(() => {
    setIsWebDAVAuthorized(
      localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_IS_AUTHENTICATED) ===
        "true"
    )
  }, [])
  const [webDAVTrackDatabaseSearchResult, setWebDAVTrackDatabaseSearchResult] =
    useState<Track[]>([]) // WebDAV (IndexedDBに楽曲情報をキャッシュ済み)
  const [webDAVSearchResult, setWebDAVSearchResult] = useState<Track[]>([]) // WebDAV (IndexedDBに楽曲情報のキャッシュ無し)

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
        setIsSearchingSpotify(true)
        setIsSearchingWebDAV(true)
        setIsSearchingWebDAVTrackDatabase(true)

        const spotifyPromise = new Promise<{
          data: []
          nextOffset: number
        } | void>(async resolve => {
          if (!isSpotifyAuthorized) {
            resolve({ data: [], nextOffset: 0 })
          }
          const spotifyRes = await searchSpotifyTracks(
            input,
            spotifySearchNextOffset as number // キーワードが変更される度にSpotifySearchNextOffsetは0にリセットされるのでundefinedにはならない
          )
          setSpotifySearchResult(
            spotifyRes.data.map(searchResultItem =>
              formatFromSpotifyTrack(searchResultItem)
            )
          )
          setSpotifySearchNextOffset(spotifyRes.nextOffset)
          setIsSearchingSpotify(false)
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
              webDAVTrackDatabaseRes.map(
                // eslint-disable-next-line unused-imports/no-unused-vars
                ({ path, ...rest }) => rest
              ) as Track[]
            )
            setIsSearchingWebDAVTrackDatabase(false)
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
          setWebDAVSearchResult(webDAVRes)
          setIsSearchingWebDAV(false)
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
          setIsSearchingSpotify(false)
          setIsSearchingWebDAV(false)
          setIsSearchingWebDAVTrackDatabase(false)
          //TODO: 検索が失敗したProviderに合わせたsetStateをすべき (闇雲に全部falseにするのではなく)
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
      if (spotifySearchNextOffset === undefined) return

      const res = await searchSpotifyTracks(keyword, spotifySearchNextOffset)
      const convertedRes = res.data.map(searchResultItem =>
        formatFromSpotifyTrack(searchResultItem)
      )
      setSpotifySearchResult(prev => [...prev, ...convertedRes])
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

  const resetAll = useCallback(() => {
    setKeyword("")
    setSpotifySearchNextOffset(0)
    setSpotifySearchResult([])
    setWebDAVTrackDatabaseSearchResult([])
    setWebDAVSearchResult([])
  }, [])

  return {
    keyword,
    handleKeywordChange,
    isSpotifyAuthorized,
    isWebDAVAuthorized,
    spotifySearchResult,
    webDAVTrackDatabaseSearchResult,
    showMoreSpotifySearchResult,
    isSearchingSpotify,
    isSearchingWebDAV,
    isSearchingWebDAVTrackDatabase,
    webDAVSearchResult,
    resetAll
  } as const
}

export default useSearch
