import { Box, Button, Flex, Input, Title, Text, Stack } from "@mantine/core"
import Image from "next/image"
import { IoIosArrowBack } from "react-icons/io"
import CircleStep from "@/app/components/parts/CircleStep"

type Props = {
  className?: string
  onBack: () => void
}

const SpotifyConnector = ({ className, onBack }: Props) => {
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
      <Stack w="100%" spacing="xs">
        <Flex
          w="fit-content"
          mx="auto"
          mb="lg"
          px="lg"
          pb="sm"
          justify="center"
          align="center"
          sx={{ borderBottom: "solid 1px #d1d1d1" }}
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

        <Flex align="center">
          <CircleStep step={1} />
          <Title ml="xs" order={4} ta="left" sx={{ flex: 1 }}>
            Client IDを入力する
          </Title>
        </Flex>

        <Box ml="1rem" py="0.2rem" sx={{ borderLeft: "solid 1px #d1d1d1" }}>
          <Input
            pl="2rem"
            placeholder="例: 8a94eb5c826471928j1jfna81920k0b7"
            sx={{ boxSizing: "border-box" }}
          />
        </Box>

        <Flex align="center">
          <CircleStep step={2} />
          <Title ml="xs" order={4} ta="left" sx={{ flex: 1 }}>
            OAuth認証を行う
          </Title>
        </Flex>

        <Box
          ml="1rem"
          pl="2rem"
          py="0.2rem"
          ta="left"
          sx={{ borderLeft: "solid 1px #d1d1d1" }}
        >
          <Button color="spotify" variant="outline">
            Spotifyでサインイン
          </Button>
        </Box>

        <Flex align="center">
          <CircleStep step={3} />
          <Title ml="xs" order={4} ta="left" sx={{ flex: 1 }}>
            MixJuiceで使用するプレイリストを選択する
          </Title>
        </Flex>

        <Box
          ml="1rem"
          pl="calc(2rem + 1px)" // 左にborderが無いのでその分右にずらす
          py="0.2rem"
          ta="left"
        >
          <Button variant="outline">プレイリストを選択</Button>
        </Box>

        <Flex
          pt="lg"
          justify="center"
          align="center"
          sx={{ cursor: "pointer" }}
          onClick={onBack}
        >
          <IoIosArrowBack color="#228be6" />
          <Text size="0.8rem" color="blue">
            接続先選択画面に戻る
          </Text>
        </Flex>
      </Stack>
    </Flex>
  )
}

export default SpotifyConnector
