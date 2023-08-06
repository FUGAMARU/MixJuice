import { useState, useCallback, useEffect } from "react"
import { useSetRecoilState } from "recoil"
import useSpotifyApi from "./useSpotifyApi"
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
  const { searchTracksByKeyword: searchWebDAVTracks } = useWebDAVTrackDatabase()
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
  const [webDAVSearchResult, setWebDAVSearchResult] = useState<
    ListItemDetail[]
  >([])

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

        const webDAVSearchPromise = isWebDAVAuthorized
          ? searchWebDAVTracks(input)
          : Promise.resolve([])

        try {
          const [spotifyRes, webDAVRes] = await Promise.all([
            spotifySearchPromise,
            webDAVSearchPromise
          ])

          setSpotifySearchResult(spotifyRes.data)
          setSpotifySearchNextOffset(spotifyRes.nextOffset)

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
        //TODO: WebDAV(未キャッシュ)の検索処理がここに入る
      }, 500)
    },
    [
      isSpotifyAuthorized,
      searchSpotifyTracks,
      setErrorModalInstance,
      spotifySearchNextOffset,
      isWebDAVAuthorized,
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
    webDAVSearchResult,
    showMoreSpotifySearchResult,
    isSearching
  } as const
}

export default useSearch
