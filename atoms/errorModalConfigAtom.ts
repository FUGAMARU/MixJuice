import { atom } from "recoil"
import { ErrorModalConfig } from "@/types/ErrorModalConfig"

export const errorModalConfigAtom = atom<ErrorModalConfig[]>({
  key: "errorModalConfigAtom",
  default: []
})
