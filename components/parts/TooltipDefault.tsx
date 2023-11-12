import { Tooltip } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { memo } from "react"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { DEFAULT_SETTING_VALUES } from "@/constants/Settings"
import { Children } from "@/types/Children"
import { SettingValues } from "@/types/DefaultSettings"

type Props = {
  label: string
  floating?: boolean
  withArrow?: boolean
} & Children

const TooltipDefault = ({ label, floating, withArrow, children }: Props) => {
  const [settings] = useLocalStorage<SettingValues>({
    key: LOCAL_STORAGE_KEYS.SETTINGS,
    defaultValue: DEFAULT_SETTING_VALUES
  })

  return floating ? (
    <Tooltip.Floating label={label} disabled={settings.HIDE_TOOLTIP}>
      {children}
    </Tooltip.Floating>
  ) : (
    <Tooltip
      label={label}
      withArrow={withArrow}
      transitionProps={{
        transition: "fade",
        duration: 300
      }}
      disabled={settings.HIDE_TOOLTIP}
    >
      {children}
    </Tooltip>
  )
}

export default memo(TooltipDefault)
