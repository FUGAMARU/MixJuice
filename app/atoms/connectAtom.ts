import { atom } from "recoil"

export const connectAtom = atom<boolean>({
  key: "connectAtom",
  default: false
})
