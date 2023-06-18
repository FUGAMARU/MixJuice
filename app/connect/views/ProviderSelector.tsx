import { Flex, Box, Title, Button, Text } from "@mantine/core"
import Image from "next/image"
import useBreakPoints from "@/app/hooks/useBreakPoints"

type Props = {
  className?: string
  isDisplay?: boolean
  onShowSpotifyConnector: () => void
  onShowWebDAVConnector: () => void
}

const ProviderSelector: React.FC<Props> = ({
  className,
  isDisplay = true,
  onShowSpotifyConnector,
  onShowWebDAVConnector
}) => {
  const { setRespVal } = useBreakPoints()

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
              variant="outline"
              size="xs"
              onClick={onShowSpotifyConnector}
            >
              接続する
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
