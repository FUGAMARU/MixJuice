import { atom } from "recoil"

export const navbarAtom = atom<boolean>({
  key: "NavbarAtom",
  default: false
})

export const navbarClassNameAtom = atom<string>({
  key: "NavbarClassNameAtom",
  default: ""
})
