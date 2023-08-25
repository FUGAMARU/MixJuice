import { atom } from "recoil"

export const searchModalAtom = atom<boolean>({
  key: "searchModalAtom",
  default: false
})
