import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useRecoilValue } from "recoil"
import useStorage from "./useStorage"
import { selectedSpotifyPlaylistsAtom } from "@/atoms/selectedSpotifyPlaylistsAtom"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { LocalStorageSpotifySelectedPlaylists } from "@/types/LocalStorageSpotifySelectedPlaylists"
import { ProviderSettingState } from "@/types/ProviderSettingState"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

const useSpotifySettingState = () => {
  const selectedPlaylists = useRecoilValue(selectedSpotifyPlaylistsAtom)
  const { getUserData } = useStorage()
  const [, loading] = useAuthState(auth)

  /**
   * done: Spotifyのログイン・プレイリストの選択が完了している
   * setting: Spotifyのログインは完了しているが、プレイリストの選択が完了していない
   * none: Spotifyのログインが完了していない
   */
  const [settingState, setSettingState] = useState<ProviderSettingState>("none")
  useEffect(() => {
    ;(async () => {
      if (loading) return

      const refreshToken = await getUserData(
        FIRESTORE_DOCUMENT_KEYS.SPOTIFY_REFRESH_TOKEN
      )

      const localStorageSelectedPlaylists = localStorage.getItem(
        LOCAL_STORAGE_KEYS.SPOTIFY_SELECTED_PLAYLISTS
      )

      if (!isDefined(refreshToken)) {
        setSettingState("none")
        return
      }

      if (
        (localStorageSelectedPlaylists === null ||
          (
            JSON.parse(
              localStorageSelectedPlaylists
            ) as LocalStorageSpotifySelectedPlaylists[]
          ).length === 0) &&
        selectedPlaylists.length === 0
      ) {
        setSettingState("setting")
        return
      }

      setSettingState("done")
    })()
  }, [selectedPlaylists, getUserData, loading])

  return { settingState } as const
}

export default useSpotifySettingState
