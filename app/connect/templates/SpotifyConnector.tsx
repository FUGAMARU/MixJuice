import { Box, Button, Flex, Input, Title, Text, Stack } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { AiFillCheckCircle } from "react-icons/ai"
import { IoIosArrowBack } from "react-icons/io"
import { useRecoilState } from "recoil"
import CircleStep from "@/app/components/parts/CircleStep"
import CheckboxListModal from "@/app/components/templates/CheckboxListModal"
import { selectedSpotifyPlaylistsAtom } from "@/atoms/selectedSpotifyPlaylistsAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import useSpotifyApi from "@/hooks/useSpotifyApi"
import useSpotifySettingState from "@/hooks/useSpotifySettingState"
import useSpotifyToken from "@/hooks/useSpotifyToken"
import styles from "@/styles/SpotifyConnector.module.css"
import { CheckboxListModalItem } from "@/types/CheckboxListModalItem"

type Props = {
  className?: string
  onBack: () => void
}

const SpotifyConnector = ({ className, onBack }: Props) => {
  const router = useRouter()
  const [
    isPlaylistSelectorOpened,
    { open: onPlaylistSelectorOpen, close: onPlaylistSelectorClose }
  ] = useDisclosure(false)
  const { redirectUri, getCode } = useSpotifyToken()
  const { getPlaylists } = useSpotifyApi()
  const { settingState } = useSpotifySettingState()
  const [selectedPlaylists, setSelectedPlaylists] = useRecoilState(
    selectedSpotifyPlaylistsAtom
  )

  const [clientId, setClientId] = useState("")
  useEffect(() => {
    const clientId = localStorage.getItem(LOCAL_STORAGE_KEYS.SPOTIFY_CLIENT_ID)
    if (clientId !== null) setClientId(clientId)
  }, [])

  const handleClientIdInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const filteredValue = e.target.value.replace(/[^a-zA-Z0-9]/g, "") // 半角英数字以外を削除
      setClientId(filteredValue)
    },
    []
  )

  const handleSigninButtonClick = useCallback(async () => {
    const args = await getCode(clientId, redirectUri)
    router.push(`https://accounts.spotify.com/authorize?${args}`)
  }, [clientId, redirectUri, router, getCode])

  const [playlists, setPlaylists] = useState<CheckboxListModalItem[]>([])
  const handleClickSelectPlaylistButton = useCallback(async () => {
    try {
      const playlists = await getPlaylists()
      setPlaylists(playlists)
      onPlaylistSelectorOpen()
    } catch (e) {
      console.log("🟥ERROR: ", e)
      if (e instanceof Error) alert(e.message) //TODO: ちゃんとしたエラー表示を実装する
    }
  }, [getPlaylists, onPlaylistSelectorOpen])

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
            onChange={handleClientIdInputChange}
          />
        </Box>

        <Flex align="center">
          <CircleStep step={2} />
          <Title ml="xs" order={4} ta="left" sx={{ flex: 1 }}>
            OAuth認証を行う
          </Title>
        </Flex>

        <Flex
          ml="1rem"
          pl="2rem"
          py="0.2rem"
          align="center"
          gap="xs"
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

          <AiFillCheckCircle
            size="1.3rem"
            color="#2ad666"
            style={{
              display:
                settingState === "setting" || settingState === "done"
                  ? "block"
                  : "none"
            }} // &&を使うと何故かうまくいかなかったのでインラインスタイルで対応
          />
        </Flex>

        <Flex align="center">
          <CircleStep step={3} />
          <Title ml="xs" order={4} ta="left" sx={{ flex: 1 }}>
            MixJuiceで使用するプレイリストを選択する
          </Title>
        </Flex>

        <Flex
          ml="1rem"
          pl="calc(2rem + 1px)" // 左にborderが無いのでその分右にずらす
          py="0.2rem"
          align="center"
          gap="xs"
          ta="left"
        >
          <Button
            className={styles.transition}
            variant="outline"
            disabled={settingState === "none"}
            onClick={handleClickSelectPlaylistButton}
          >
            プレイリストを選択
          </Button>

          <AiFillCheckCircle
            size="1.3rem"
            color="#2ad666"
            style={{ display: settingState === "done" ? "block" : "none" }}
          />
        </Flex>

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

      <CheckboxListModal
        opened={isPlaylistSelectorOpened}
        onClose={onPlaylistSelectorClose}
        title="MixJuiceで使用するプレイリストを選択"
        items={playlists}
        color="spotify"
        dispath={setSelectedPlaylists}
      />
    </Flex>
  )
}

export default SpotifyConnector
