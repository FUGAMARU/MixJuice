import { atom } from "recoil"
import { PagePath } from "@/types/PagePath"

export const loadingAtom = atom<{
  stateChangedOn: PagePath | undefined
  state: boolean
}>({
  key: "loadingAtom",
  default: {
    stateChangedOn: undefined,
    state: false
  }
})
