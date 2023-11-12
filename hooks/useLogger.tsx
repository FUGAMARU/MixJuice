import { useLocalStorage } from "@mantine/hooks"
import { useCallback } from "react"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { DEFAULT_SETTING_VALUES } from "@/constants/Settings"
import { SettingValues } from "@/types/DefaultSettings"

const useLogger = () => {
  const [settings] = useLocalStorage<SettingValues>({
    key: LOCAL_STORAGE_KEYS.SETTINGS,
    defaultValue: DEFAULT_SETTING_VALUES
  })

  return useCallback(
    (
      label: "error" | "warning" | "info" | "success" | "none",
      message: string | unknown
    ) => {
      if (!settings.DEBUGMODE) return

      switch (label) {
        case "error":
          console.log(`🟥ERROR: ${message}`)
          break
        case "warning":
          console.log(`🟧WARNING: ${message}`)
          break
        case "info":
          console.log(`🟦INFO: ${message}`)
          break
        case "success":
          console.log(`🟩SUCCESS: ${message}`)
          break
        default:
          console.log(message)
          break
      }
    },
    [settings.DEBUGMODE]
  )
}

export default useLogger
