import { atom } from "recoil"

export const playerHeightAtom = atom<number>({
  key: "playerHeightAtom",
  default: 0
})
