import { atom } from "recoil"
import { Track } from "@/types/Track"

export const playbackHistoryAtom = atom<Track[]>({
  key: "playbackHistoryAtom",
  default: []
})
