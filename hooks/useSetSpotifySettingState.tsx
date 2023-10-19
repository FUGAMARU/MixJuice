import { useEffect } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import useStorage from "./useStorage"
import { selectedSpotifyPlaylistsAtom } from "@/atoms/selectedSpotifyPlaylistsAtom"
import { spotifySettingStateAtom } from "@/atoms/spotifySettingStateAtom"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { LocalStorageSpotifySelectedPlaylists } from "@/types/LocalStorageSpotifySelectedPlaylists"
import { isDefined } from "@/utils/isDefined"

type Args = {
  isLoadingUser: boolean
}

const useSetSpotifySettingState = ({ isLoadingUser }: Args) => {
  const selectedPlaylists = useRecoilValue(selectedSpotifyPlaylistsAtom)
  const { getUserData } = useStorage()

  /**
   * done: Spotifyのログイン・プレイリストの選択が完了している
   * setting: Spotifyのログインは完了しているが、プレイリストの選択が完了していない
   * none: Spotifyのログインが完了していない
   */
  const setSettingState = useSetRecoilState(spotifySettingStateAtom)
  useEffect(() => {
    ;(async () => {
      if (isLoadingUser) return

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
  }, [selectedPlaylists, getUserData, isLoadingUser, setSettingState])
}

export default useSetSpotifySettingState
