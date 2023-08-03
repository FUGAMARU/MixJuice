import { atom } from "recoil"

export const selectedWebDAVFoldersAtom = atom<string[]>({
  key: "selectedWebDAVFoldersAtom",
  default: []
})
