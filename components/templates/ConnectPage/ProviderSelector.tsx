import { Flex, Box, Title, Text, Center } from "@mantine/core"
import { useRouter } from "next/navigation"
import { memo } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { loadingAtom } from "@/atoms/loadingAtom"
import { spotifySettingStateAtom } from "@/atoms/spotifySettingStateAtom"
import { webDAVSettingStateAtom } from "@/atoms/webDAVSettingStateAtom"
import ArrowTextButton from "@/components/parts/ArrowTextButton"
import ProviderSelectorItem from "@/components/parts/ProviderSelectorItem"
import useBreakPoints from "@/hooks/useBreakPoints"

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
  const setIsLoading = useSetRecoilState(loadingAtom)
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
              onClick={async () => {
                setIsLoading({
                  stateChangedOn: "ConnectPage",
                  state: true
                })
                await new Promise(resolve => setTimeout(resolve, 300))
                router.push("/")
              }}
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
