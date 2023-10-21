import { useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useRecoilValue, useSetRecoilState } from "recoil"
import useStorage from "./useStorage"
import { selectedSpotifyPlaylistsAtom } from "@/atoms/selectedSpotifyPlaylistsAtom"
import { spotifySettingStateAtom } from "@/atoms/spotifySettingStateAtom"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { LocalStorageSpotifySelectedPlaylists } from "@/types/LocalStorageSpotifySelectedPlaylists"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

const useSetSpotifySettingState = () => {
  const selectedPlaylists = useRecoilValue(selectedSpotifyPlaylistsAtom)
  const { userData } = useStorage({ initialize: false })
  const [, isLoadingUserInfo] = useAuthState(auth)

  /**
   * done: Spotifyのログイン・プレイリストの選択が完了している
   * setting: Spotifyのログインは完了しているが、プレイリストの選択が完了していない
   * none: Spotifyのログインが完了していない
   */
  const setSettingState = useSetRecoilState(spotifySettingStateAtom)
  useEffect(() => {
    if (isLoadingUserInfo || !isDefined(userData)) return

    const refreshToken = userData[FIRESTORE_DOCUMENT_KEYS.SPOTIFY_REFRESH_TOKEN]

    const localStorageSelectedPlaylists = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_SELECTED_PLAYLISTS
    )

    if (!isDefined(refreshToken)) {
      setSettingState("none")
      return
    }

    if (
      (!isDefined(localStorageSelectedPlaylists) ||
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
  }, [selectedPlaylists, userData, isLoadingUserInfo, setSettingState])
}

export default useSetSpotifySettingState
