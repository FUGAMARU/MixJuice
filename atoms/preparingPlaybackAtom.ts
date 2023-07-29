import { atom } from "recoil"

export const preparingPlaybackAtom = atom<boolean>({
  key: "preparingPlaybackAtom",
  default: false
})
