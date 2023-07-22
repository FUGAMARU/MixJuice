import { Box, Title, Button } from "@mantine/core"
import Image from "next/image"
import { memo } from "react"
import { ProviderSettingState } from "@/types/ProviderSettingState"

type Props = {
  providerName: string
  providerIconSrc: string
  buttonColor: string
  settingState: ProviderSettingState
  onButtonClick: () => void
}

const ProviderSelectorItem = ({
  providerName,
  providerIconSrc,
  buttonColor,
  settingState,
  onButtonClick
}: Props) => {
  return (
    <Box>
      <Image
        src={providerIconSrc}
        width={50}
        height={50}
        alt="Provider Logo or Icon"
      />
      <Title order={5}>{providerName}</Title>
      <Button
        mt="xs"
        color={buttonColor}
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
