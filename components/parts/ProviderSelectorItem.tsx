import { Box, Title, Button } from "@mantine/core"
import Image from "next/image"
import { memo } from "react"
import { PROVIDER_ICON_SRC } from "@/constants/ProviderIconSrc"
import { PROVIDER_NAME } from "@/constants/ProviderName"
import { Provider } from "@/types/Provider"
import { ProviderSettingState } from "@/types/ProviderSettingState"

type Props = {
  provider: Provider
  settingState: ProviderSettingState | undefined
  onButtonClick: () => void
}

const ProviderSelectorItem = ({
  provider,
  settingState,
  onButtonClick
}: Props) => {
  return (
    <Box>
      <Image
        src={PROVIDER_ICON_SRC[provider]}
        width={50}
        height={50}
        alt="Provider Logo or Icon"
      />
      <Title order={5}>{PROVIDER_NAME[provider]}</Title>
      <Button
        mt="xs"
        color={provider}
        variant={settingState === "none" ? "outline" : "filled"}
        size="xs"
        onClick={onButtonClick}
      >
        {settingState === "done"
          ? "設定する"
          : settingState === "setting"
          ? "接続を再開する"
          : "接続する"}
      </Button>
    </Box>
  )
}

export default memo(ProviderSelectorItem)
