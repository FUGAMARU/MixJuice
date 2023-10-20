import { atom } from "recoil"
import { UserData } from "@/types/UserData"

export const userDataAtom = atom<UserData | undefined>({
  key: "userDataAtom",
  default: undefined
})
