import { Box, Button, Flex, Input, Stack, Title, Text } from "@mantine/core"
import Image from "next/image"
import { IoIosArrowBack } from "react-icons/io"
import CircleStep from "@/app/components/parts/CircleStep"

type Props = {
  className?: string
  onBack: () => void
}

const SpotifyConnector: React.FC<Props> = ({ className, onBack }) => {
  return (
    <Flex
      className={className}
      w="100%"
      h="100%"
      align="center"
      sx={{
        animationTimingFunction: "ease-out"
      }}
    >
      <Stack w="100%" spacing="lg">
        <Flex
          w="fit-content"
          mx="auto"
          px="lg"
          pb="sm"
          justify="center"
          align="center"
          sx={{ borderBottom: "solid 2px #d1d1d1" }}
        >
          <Image
            src="/spotify-logo.png"
            width={25}
            height={25}
            alt="spotify-logo"
          />
          <Title ml="0.3rem" order={4}>
            Spotifyと接続する
          </Title>
        </Flex>

        <Box>
          <Flex mb="0.5rem" align="center">
            <CircleStep step={1} />
            <Title ml="xs" order={4} ta="left" sx={{ flex: 1 }}>
              Client IDを入力する
            </Title>
          </Flex>

          <Input pl="3rem" placeholder="例: 8a94eb5c826471928j1jfna81920k0b7" />
        </Box>

        <Box>
          <Flex mb="0.5rem" align="center">
            <CircleStep step={2} />
            <Title ml="xs" order={4} ta="left" sx={{ flex: 1 }}>
              OAuth認証を行う
            </Title>
          </Flex>

          <Box pl="3rem" ta="left">
            <Button color="spotify" variant="outline">
              Spotifyでサインイン
            </Button>
          </Box>
        </Box>

        <Box>
          <Flex mb="0.5rem" align="center">
            <CircleStep step={3} />
            <Title ml="xs" order={4} ta="left" sx={{ flex: 1 }}>
              MixJuiceで使用するプレイリストを選択する
            </Title>
          </Flex>

          <Box pl="3rem" ta="left">
            <Button variant="outline">プレイリストを選択</Button>
          </Box>
        </Box>

        <Flex
          pt="lg"
          justify="center"
          align="center"
          sx={{ cursor: "pointer" }}
          onClick={onBack}
        >
          <IoIosArrowBack color="#027aff" />
          <Text size="0.8rem" color="#027aff">
            接続先選択画面に戻る
          </Text>
        </Flex>
      </Stack>
    </Flex>
  )
}

export default SpotifyConnector
