import { atom } from "recoil"

export const selectedSpotifyPlaylistsAtom = atom<string[]>({
  key: "selectedSpotifyPlaylistsAtom",
  default: []
})
