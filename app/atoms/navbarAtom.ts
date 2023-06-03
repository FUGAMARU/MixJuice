import { atom } from "recoil"

export const navbarAtom = atom<boolean>({
  key: "navbarAtom",
  default: false
})

export const navbarClassNameAtom = atom<string>({
  key: "navbarClassNameAtom",
  default: ""
})
