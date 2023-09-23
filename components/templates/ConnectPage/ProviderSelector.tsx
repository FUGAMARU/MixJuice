import { Flex, Box, Title, Text, Center } from "@mantine/core"
import { useRouter } from "next/navigation"
import { memo } from "react"
import ArrowTextButton from "@/components/parts/ArrowTextButton"
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
  const router = useRouter()
  const { setRespVal } = useBreakPoints()
  const { settingState: spotifySettingState } = useSpotifySettingState()
  const { settingState: webDAVSettingState } = useWebDAVSettingState()

  return (
    <Center
      className={className}
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
            provider="spotify"
            settingState={spotifySettingState}
            onButtonClick={onShowSpotifyConnector}
          />

          <ProviderSelectorItem
            provider="webdav"
            settingState={webDAVSettingState}
            onButtonClick={onShowWebDAVConnector}
          />
        </Flex>

        {(spotifySettingState === "done" || webDAVSettingState === "done") && (
          <Center mt="3rem">
            <ArrowTextButton direction="right" onClick={() => router.push("/")}>
              メインページに移動する
            </ArrowTextButton>
          </Center>
        )}
      </Box>
    </Center>
  )
}

export default memo(ProviderSelector)
