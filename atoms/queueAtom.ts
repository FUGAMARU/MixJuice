import { atom } from "recoil"
import { Track } from "@/types/Track"

export const queueAtom = atom<Track[]>({
  key: "queueAtom",
  default: []
})
