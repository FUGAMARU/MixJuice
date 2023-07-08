import { atom } from "recoil"
import { MusicListItem } from "@/types/MusicListItem"

export const musicListAtom = atom<MusicListItem[]>({
  key: "musicListAtom",
  default: []
})
