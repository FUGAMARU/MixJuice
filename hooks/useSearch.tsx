import { useState, useCallback } from "react"
import useErrorModal from "./useErrorModal"
import useMergedWebDAVServerData from "./useMergedWebDAVServerData"
import useSpotifyApi from "./useSpotifyApi"
import useSpotifySettingState from "./useSpotifySettingState"
import useWebDAVSettingState from "./useWebDAVSettingState"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { Track, formatFromSpotifyTrack } from "@/types/Track"

let timer: NodeJS.Timer

const useSearch = () => {
  const { showError } = useErrorModal()
  const [keyword, setKeyword] = useState("")

  const [isSearchingSpotify, setIsSearchingSpotify] = useState(false)
  const {
    searchAndMergeWebDAVMusicInfo,
    mergedSearchResult: mergedWebDAVSearchResult,
    resetMergedSearchResult: resetMergedWebDAVSearchResult
  } = useMergedWebDAVServerData()
  const { searchTracks: searchSpotifyTracks } = useSpotifyApi({
    initialize: false
  })
  const { settingState: webDAVSettingState } = useWebDAVSettingState()
  const { settingState: spotifySettingState } = useSpotifySettingState()
  const [spotifySearchNextOffset, setSpotifySearchNextOffset] = useState<
    number | undefined
  >(0)
  const [spotifySearchResult, setSpotifySearchResult] = useState<Track[]>([])

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
        const spotifyPromise = new Promise<{
          data: []
          nextOffset: number
        } | void>(async (resolve, reject) => {
          setIsSearchingSpotify(true)

          if (spotifySettingState === "none") {
            resolve({ data: [], nextOffset: 0 })
          }

          try {
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
            resolve()
          } catch (e) {
            reject(e)
          } finally {
            setIsSearchingSpotify(false)
          }
        })

        const webDAVPromise = new Promise<[] | void>(
          async (resolve, reject) => {
            const folderPaths = localStorage.getItem(
              LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS
            )

            if (webDAVSettingState === "none" || !folderPaths) resolve([])

            try {
              searchAndMergeWebDAVMusicInfo(JSON.parse(folderPaths!), input) // awaitは意図的につけていない
              resolve()
            } catch (e) {
              reject(e)
            } finally {
              resetMergedWebDAVSearchResult()
            }
          }
        )

        try {
          await Promise.all([spotifyPromise, webDAVPromise])
        } catch (e) {
          showError(e)
          setIsSearchingSpotify(false)
          resetMergedWebDAVSearchResult()
          //TODO: 検索が失敗したProviderに合わせたsetStateをすべき (闇雲に全部falseにするのではなく)
        }
      }, 500)
    },
    [
      spotifySettingState,
      searchSpotifyTracks,
      spotifySearchNextOffset,
      webDAVSettingState,
      showError,
      searchAndMergeWebDAVMusicInfo,
      resetMergedWebDAVSearchResult
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
      showError(e)
    }
  }, [keyword, searchSpotifyTracks, showError, spotifySearchNextOffset])

  const resetAll = useCallback(() => {
    setKeyword("")
    setSpotifySearchNextOffset(0)
    setSpotifySearchResult([])
    resetMergedWebDAVSearchResult()
  }, [resetMergedWebDAVSearchResult])

  return {
    keyword,
    handleKeywordChange,
    spotifySearchResult,
    showMoreSpotifySearchResult,
    isSearchingSpotify,
    mergedWebDAVSearchResult,
    resetAll
  } as const
}

export default useSearch
