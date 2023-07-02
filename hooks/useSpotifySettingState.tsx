import { useEffect, useState } from "react"
import { useRecoilValue } from "recoil"
import { selectedSpotifyPlaylistsAtom } from "@/atoms/selectedSpotifyPlaylistsAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"

const useSpotifySettingState = () => {
  const selectedPlaylists = useRecoilValue(selectedSpotifyPlaylistsAtom)

  /**
   * done: Spotifyのログイン・プレイリストの選択が完了している
   * setting: Spotifyのログインは完了しているが、プレイリストの選択が完了していない
   * none: Spotifyのログインが完了していない
   */
  const [settingState, setSettingState] = useState<"done" | "setting" | "none">(
    "none"
  )
  useEffect(() => {
    const refreshToken = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN
    )

    if (refreshToken === null) {
      setSettingState("none")
      return
    }

    if (selectedPlaylists.length === 0) {
      setSettingState("setting")
      return
    }

    setSettingState("done")
  }, [selectedPlaylists])

  return { settingState }
}

export default useSpotifySettingState
