import { Flex, Box, Title, Text, Center } from "@mantine/core"
import { memo } from "react"
import ProviderSelectorItem from "@/components/parts/ProviderSelectorItem"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSpotifySettingState from "@/hooks/useSpotifySettingState"
import useWebDAVSettingState from "@/hooks/useWebDAVSettingState"

type Props = {
  className?: string
  isDisplay?: boolean
  onShowSpotifyConnector: () => void
  onShowWebDAVConnector: () => void
}

const ProviderSelector = ({
  className,
  isDisplay = true,
  onShowSpotifyConnector,
  onShowWebDAVConnector
}: Props) => {
  const { setRespVal } = useBreakPoints()
  const { settingState: spotifySettingState } = useSpotifySettingState()
  const { settingState: webDAVSettingState } = useWebDAVSettingState()

  return (
    <Center
      className={className}
      w="100%"
      h="100%"
      sx={{
        display: isDisplay ? "flex" : "none"
      }}
    >
      <Box>
        <Title size={setRespVal("1.2rem", "1.4rem", "1.4rem")}>
          どのサービスと接続しますか？
        </Title>
        <Text size={setRespVal("0.8rem", "0.9rem", "0.9rem")}>
          MixJuiceと関連サービスを紐づけましょう！
        </Text>

        <Flex w="100%" mt="2rem" justify="space-around">
          <ProviderSelectorItem
            providerName="Spotify"
            providerIconSrc="/spotify-logo.png"
            buttonColor="spotify"
            settingState={spotifySettingState}
            onButtonClick={onShowSpotifyConnector}
          />

          <ProviderSelectorItem
            providerName="WebDAV"
            providerIconSrc="/server-icon.png"
            buttonColor="webdav"
            settingState={webDAVSettingState}
            onButtonClick={onShowWebDAVConnector}
          />
        </Flex>
      </Box>
    </Center>
  )
}

export default memo(ProviderSelector)
