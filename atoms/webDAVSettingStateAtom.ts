import { atom } from "recoil"
import { ProviderSettingState } from "@/types/ProviderSettingState"

export const webDAVSettingStateAtom = atom<ProviderSettingState>({
  key: "webDAVSettingStateAtom",
  default: "none"
})
