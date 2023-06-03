import { atom } from "recoil"

export const loadingAtom = atom<boolean>({
  key: "loadingAtom",
  default: true
})
