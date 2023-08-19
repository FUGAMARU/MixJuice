import { atom } from "recoil"
import { Queue } from "@/types/Queue"

export const queueAtom = atom<Queue[]>({
  key: "queueAtom",
  default: []
})
