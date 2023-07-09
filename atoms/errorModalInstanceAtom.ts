import { atom } from "recoil"

export const errorModalInstanceAtom = atom<unknown[]>({
  key: "errorModalInstanceAtom",
  default: []
})
