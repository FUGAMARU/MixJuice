import { useState, useCallback } from "react"
import useSpotifyApi from "./useSpotifyApi"
import useWebDAVServer from "./useWebDAVServer"
import { Provider } from "@/types/Provider"
import {
  Track,
  formatFromSpotifyTrack,
  TrackWithPath,
  removePathProperty
} from "@/types/Track"

const useTarckModal = () => {
  const { getPlaylistTracks } = useSpotifyApi({ initialize: false })
  const { getFolderTracks, getTrackInfo } = useWebDAVServer()

  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [provider, setProvider] = useState<Provider>()
  const [tracks, setTracks] = useState<Track[] | undefined>()
  const handleNavbarCheckboxLabelClick = useCallback(
    async (provider: Provider, id: string, title: string) => {
      setTracks(undefined) // 前回のデーターが残っている場合に表示されるのを防ぐ
      setTitle(title)
      setProvider(provider)
      setIsOpen(true)

      switch (provider) {
        case "spotify":
          const playlistTracks = await getPlaylistTracks(id)
          const tracks = playlistTracks.map(playlistTrack =>
            formatFromSpotifyTrack(playlistTrack)
          )
          setTracks(tracks)
          break
        case "webdav":
          const folderTrackFiles = await getFolderTracks(id, "")
          const folderTracksInfo: TrackWithPath[] = []
          for (const trackFile of folderTrackFiles) {
            // 並列処理でやると全件取得できないかもしれない(未検証)ので逐次処理で取得
            const trackInfo = await getTrackInfo(trackFile)
            folderTracksInfo.push(trackInfo)
          }
          setTracks(
            folderTracksInfo.map(trackWithPath =>
              removePathProperty(trackWithPath)
            )
          )
          break
      }
    },
    [getPlaylistTracks, getFolderTracks, getTrackInfo, setIsOpen]
  )

  return {
    isOpen,
    setIsOpen,
    title,
    provider,
    tracks,
    handleNavbarCheckboxLabelClick
  } as const
}

export default useTarckModal
