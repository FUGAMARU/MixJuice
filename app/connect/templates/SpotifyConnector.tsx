import { Box, Button, Flex, Input, Title, Text, Stack } from "@mantine/core"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { IoIosArrowBack } from "react-icons/io"
import CircleStep from "@/app/components/parts/CircleStep"

import styles from "@/styles/SpotifyConnector.module.css"
import { getCode } from "@/utils/spotify-api"

type Props = {
  className?: string
  onBack: () => void
}

const SpotifyConnector = ({ className, onBack }: Props) => {
  const router = useRouter()
  const [clientId, setClientId] = useState("")

  /** 現在のアドレスからコールバック用のリダイレクトURIを求める */
  const [redirectUri, setRedirectUri] = useState("")
  useEffect(() => {
    const currentURL = window.location.href
    const url = new URL(currentURL)
    setRedirectUri(`${url.protocol}//${url.host}/callback/spotify`)
  }, [])

  const handleSigninButtonClick = useCallback(async () => {
    const args = await getCode(clientId, redirectUri)
    router.push(`https://accounts.spotify.com/authorize?${args}`)
  }, [clientId, redirectUri, router])

  const [isPlaylistSelectButtonDisabled, setIsPlaylistSelectButtonDisabled] =
    useState(true)
  useEffect(() => {
    const spotifyAccessToken = localStorage.getItem("spotify_access_token")
    if (spotifyAccessToken) {
      // nullチェックと空文字チェックを兼ねているのでifを使っている
      setIsPlaylistSelectButtonDisabled(false)
      return
    }
    setIsPlaylistSelectButtonDisabled(true)
  }, [])

  useEffect(() => {
    const clientId = localStorage.getItem("spotify_client_id")
    if (clientId !== null) setClientId(clientId)
  }, [])

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
            className={styles.clientId}
            pl="2rem"
            placeholder="例: 8a94eb5c826471928j1jfna81920k0b7"
            sx={{ boxSizing: "border-box" }}
            value={clientId}
            onChange={e => setClientId(e.currentTarget.value)}
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
          <Button
            className={styles.transition}
            color="spotify"
            variant="outline"
            disabled={clientId === ""}
            onClick={handleSigninButtonClick}
          >
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
          <Button
            className={styles.transition}
            variant="outline"
            disabled={isPlaylistSelectButtonDisabled}
          >
            プレイリストを選択
          </Button>
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
