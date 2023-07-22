import { useState } from "react"
import { ProviderSettingState } from "@/types/ProviderSettingState"

const useWebDAVSettingState = () => {
  const [settingState, setSettingState] = useState<ProviderSettingState>("none")

  return { settingState } as const
}

export default useWebDAVSettingState
