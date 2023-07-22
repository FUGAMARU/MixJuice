import { atom } from "recoil"

export const selectedWebDAVFolderAtom = atom<string | undefined>({
  key: "selectedWebDAVFolderAtom",
  default: undefined
})
