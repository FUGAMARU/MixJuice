import { Flex, Box, Title, Button, Text } from "@mantine/core"
import Image from "next/image"
import { useEffect, useState } from "react"
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
  const { setRespVal } = useBreakPoints()

  const [isSettingUpSpotify, setIsSettingUpSpotify] = useState(false)
  useEffect(() => {
    const spotifyAccessToken = localStorage.getItem("spotify_access_token")
    // TODO: プレイリストが1つも選択されていないという条件を追加する
    if (spotifyAccessToken) {
      // nullチェックと空文字チェックを兼ねているのでifを使っている
      setIsSettingUpSpotify(true)
      return
    }
    setIsSettingUpSpotify(false)
  }, [])

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
              {isSettingUpSpotify ? "設定を再開する" : "接続する"}
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
