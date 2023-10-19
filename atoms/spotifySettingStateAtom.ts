import { atom } from "recoil"
import { ProviderSettingState } from "@/types/ProviderSettingState"

export const spotifySettingStateAtom = atom<ProviderSettingState>({
  key: "spotifySettingStateAtom",
  default: "none"
})
