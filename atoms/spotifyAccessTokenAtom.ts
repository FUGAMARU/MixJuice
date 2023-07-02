import { atom } from "recoil"
import { SpotifyAccessToken } from "@/types/SpotifyAccessToken"

export const spotifyAccessTokenAtom = atom<SpotifyAccessToken | undefined>({
  key: "spotifyAccessTokenAtom",
  default: undefined
})
