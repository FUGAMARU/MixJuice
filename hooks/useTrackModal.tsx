import { useState, useCallback } from "react"
import useErrorModal from "./useErrorModal"
import useMergedWebDAVServerData from "./useMergedWebDAVServerData"
import useSpotifyApi from "./useSpotifyApi"
import { Provider } from "@/types/Provider"
import { Track, formatFromSpotifyTrack } from "@/types/Track"

const useTarckModal = () => {
  const { showError } = useErrorModal()

  const { getPlaylistTracks } = useSpotifyApi({ initialize: false })
  const [spotifyTracks, setSpotifyTracks] = useState<Track[] | undefined>()

  const {
    searchAndMergeWebDAVMusicInfo,
    mergedSearchResult: mergedWebDAVSearchResult,
    setMergedSearchResult: setMergedWebDAVSearchResult
  } = useMergedWebDAVServerData()

  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [provider, setProvider] = useState<Provider>()

  const handleNavbarCheckboxLabelClick = useCallback(
    async (provider: Provider, id: string, title: string) => {
      // 前回のデーターが残っている場合に表示されるのを防ぐ
      setSpotifyTracks(undefined)
      setMergedWebDAVSearchResult({
        status: "IDLE",
        data: []
      })

      setTitle(title)
      setProvider(provider)
      setIsOpen(true)

      try {
        switch (provider) {
          case "spotify":
            const playlistTracks = await getPlaylistTracks(id)
            const tracks = playlistTracks.map(playlistTrack =>
              formatFromSpotifyTrack(playlistTrack)
            )
            setSpotifyTracks(tracks)
            break
          case "webdav":
            await searchAndMergeWebDAVMusicInfo([id], "")
            break
        }
      } catch (e) {
        showError(e)
        setIsOpen(false)
      }
    },
    [
      getPlaylistTracks,
      setIsOpen,
      showError,
      searchAndMergeWebDAVMusicInfo,
      setMergedWebDAVSearchResult
    ]
  )

  return {
    isOpen,
    setIsOpen,
    title,
    provider,
    spotifyTracks,
    handleNavbarCheckboxLabelClick,
    mergedWebDAVSearchResult
  } as const
}

export default useTarckModal
