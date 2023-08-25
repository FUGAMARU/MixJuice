import { useState, useCallback, useEffect } from "react"
import { useSetRecoilState } from "recoil"
import useSpotifyApi from "./useSpotifyApi"
import useWebDAVServer from "./useWebDAVServer"
import useWebDAVTrackDatabase from "./useWebDAVTrackDatabase"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { Provider } from "@/types/Provider"
import { Track } from "@/types/Track"

let timer: NodeJS.Timer

const useSearch = () => {
  const [keyword, setKeyword] = useState("")

  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const [isSearching, setIsSearching] = useState(false)
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
  const [spotifySearchNextOffset, setSpotifySearchNextOffset] = useState(0)
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
          setSpotifySearchResult(
            spotifyRes.data.map(searchResultItem => {
              return {
                id: searchResultItem.id,
                provider: "spotify",
                title: searchResultItem.name,
                albumTitle: searchResultItem.album.name,
                artist: searchResultItem.artists
                  .map(artist => artist.name)
                  .join(", "),
                image: {
                  src: searchResultItem.album.images[0].url,
                  height: searchResultItem.album.images[0].height,
                  width: searchResultItem.album.images[0].width
                },
                duration: searchResultItem.duration_ms
              }
            })
          )
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
              webDAVTrackDatabaseRes.map(
                // eslint-disable-next-line unused-imports/no-unused-vars
                ({ path, ...rest }) => rest
              ) as Track[]
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
          setWebDAVSearchResult(webDAVRes)
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
      const convertedRes = res.data.map(searchResultItem => {
        return {
          id: searchResultItem.id,
          provider: "spotify" as Provider,
          title: searchResultItem.name,
          albumTitle: searchResultItem.album.name,
          artist: searchResultItem.artists
            .map(artist => artist.name)
            .join("・"),
          image: {
            src: searchResultItem.album.images[0].url,
            height: searchResultItem.album.images[0].height,
            width: searchResultItem.album.images[0].width
          },
          duration: searchResultItem.duration_ms
        }
      })
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
    isSearching,
    webDAVSearchResult,
    resetAll
  } as const
}

export default useSearch
