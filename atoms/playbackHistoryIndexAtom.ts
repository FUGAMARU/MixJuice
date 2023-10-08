import { atom } from "recoil"

export const playbackHistoryIndexAtom = atom<number>({
  key: "playbackHistoryIndexAtom",
  default: 0
})
