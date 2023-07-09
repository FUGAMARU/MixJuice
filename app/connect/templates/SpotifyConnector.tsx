import { Box, Button, Flex, Input, Title, Text, Stack } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { AiFillCheckCircle } from "react-icons/ai"
import { IoIosArrowBack } from "react-icons/io"
import { useRecoilState, useSetRecoilState } from "recoil"
import CircleStep from "@/app/components/parts/CircleStep"
import CheckboxListModal from "@/app/components/templates/CheckboxListModal"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { selectedSpotifyPlaylistsAtom } from "@/atoms/selectedSpotifyPlaylistsAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import useSpotifyApi from "@/hooks/useSpotifyApi"
import useSpotifySettingState from "@/hooks/useSpotifySettingState"
import useSpotifyToken from "@/hooks/useSpotifyToken"
import styles from "@/styles/SpotifyConnector.module.css"
import { CheckboxListModalItem } from "@/types/CheckboxListModalItem"
import { LocalStorageSpotifySelectedPlaylists } from "@/types/LocalStorageSpotifySelectedPlaylists"

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
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)

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
      setPlaylists(
        playlists.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          imgSrc: item.images[0].url
        }))
      )
      onPlaylistSelectorOpen()
    } catch (e) {
      setErrorModalInstance(prev => [...prev, e])
    }
  }, [getPlaylists, onPlaylistSelectorOpen, setErrorModalInstance])

  /** 遷移してきた時に過去に選択したプレイリストにチェックを入れておき、プレイリストが選択される度にlocalStorageを更新する */
  const [selectedPlaylists, setSelectedPlaylists] = useRecoilState(
    selectedSpotifyPlaylistsAtom
  )
  useEffect(() => {
    const localStorageSelectedPlaylists = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_SELECTED_PLAYLISTS
    )

    if (localStorageSelectedPlaylists === null) return

    const parsed = JSON.parse(
      localStorageSelectedPlaylists
    ) as LocalStorageSpotifySelectedPlaylists[]

    setSelectedPlaylists(parsed.map(obj => obj.id))
  }, [setSelectedPlaylists])

  useEffect(() => {
    if (selectedPlaylists.length === 0) return

    const linkedSelectedPlaylists: LocalStorageSpotifySelectedPlaylists[] =
      selectedPlaylists.map(id => {
        const item = playlists.find(obj => obj.id === id)
        return {
          id: id,
          title: item?.name || ""
        }
      })

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_SELECTED_PLAYLISTS,
      JSON.stringify(linkedSelectedPlaylists)
    )
  }, [selectedPlaylists, playlists])

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
          gap="0.3rem"
          sx={{ borderBottom: "solid 1px #d1d1d1" }}
        >
          <Image
            src="/spotify-logo.png"
            width={25}
            height={25}
            alt="spotify-logo"
          />
          <Title order={4}>Spotifyと接続する</Title>
        </Flex>

        <Flex align="center" gap="xs">
          <CircleStep step={1} />
          <Title order={4} ta="left" sx={{ flex: 1 }}>
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

        <Flex align="center" gap="xs">
          <CircleStep step={2} />
          <Title order={4} ta="left" sx={{ flex: 1 }}>
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

        <Flex align="center" gap="xs">
          <CircleStep step={3} />
          <Title order={4} ta="left" sx={{ flex: 1 }}>
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
        color="spotify"
        items={playlists}
        checkedValues={selectedPlaylists}
        dispath={setSelectedPlaylists}
      />
    </Flex>
  )
}

export default SpotifyConnector
