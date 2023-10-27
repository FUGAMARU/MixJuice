import { Flex, Box, Title, Text, Center } from "@mantine/core"
import { memo } from "react"
import { useRecoilValue } from "recoil"
import { spotifySettingStateAtom } from "@/atoms/spotifySettingStateAtom"
import { webDAVSettingStateAtom } from "@/atoms/webDAVSettingStateAtom"
import ArrowTextButton from "@/components/parts/ArrowTextButton"
import ProviderSelectorItem from "@/components/parts/ProviderSelectorItem"
import { PAGE_PATH } from "@/constants/PagePath"
import useBreakPoints from "@/hooks/useBreakPoints"
import useTransit from "@/hooks/useTransit"

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
  const { onTransit } = useTransit()
  const { setRespVal } = useBreakPoints()
  const spotifySettingState = useRecoilValue(spotifySettingStateAtom)
  const webDAVSettingState = useRecoilValue(webDAVSettingStateAtom)

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
            <ArrowTextButton
              direction="right"
              onClick={() =>
                onTransit(PAGE_PATH.CONNECT_PAGE, PAGE_PATH.MAIN_PAGE)
              }
            >
              メインページに移動する
            </ArrowTextButton>
          </Center>
        )}
      </Box>
    </Center>
  )
}

export default memo(ProviderSelector)
