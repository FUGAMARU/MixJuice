import { atom } from "recoil"

export const webDAVAuthenticatedAtom = atom<boolean>({
  key: "webDAVAuthenticatedAtom",
  default: false
})
