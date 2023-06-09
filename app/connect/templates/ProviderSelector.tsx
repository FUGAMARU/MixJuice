import { Flex, Box, Title, Button, Text } from "@mantine/core"
import Image from "next/image"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSpotifySettingState from "@/hooks/useSpotifySettingState"

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

  return (
    <Flex
      className={className}
      w="100%"
      h="100%"
      justify="center"
      align="center"
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
          <Box>
            <Image
              src="/spotify-logo.png"
              width={50}
              height={50}
              alt="spotify-logo"
            />
            <Title order={5}>Spotify</Title>
            <Button
              mt="xs"
              color="spotify"
              variant={spotifySettingState === "none" ? "outline" : "filled"}
              size="xs"
              onClick={onShowSpotifyConnector}
            >
              {spotifySettingState === "done"
                ? "設定する"
                : spotifySettingState === "setting"
                ? "接続を再開する"
                : "接続する"}
            </Button>
          </Box>

          <Box>
            <Image
              src="/server-icon.svg"
              width={50}
              height={50}
              alt="webdav-logo"
            />
            <Title order={5}>WebDAV</Title>
            <Button
              mt="xs"
              color="grape"
              variant="outline"
              size="xs"
              onClick={onShowWebDAVConnector}
            >
              接続する
            </Button>
          </Box>
        </Flex>
      </Box>
    </Flex>
  )
}

export default ProviderSelector
