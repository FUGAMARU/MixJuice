import { Box, Button, Flex, Input, Title, useMantineTheme } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useRouter } from "next/navigation"
import { ChangeEvent, memo, useCallback, useEffect, useState } from "react"
import { AiFillCheckCircle } from "react-icons/ai"
import { useRecoilState, useSetRecoilState } from "recoil"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { selectedSpotifyPlaylistsAtom } from "@/atoms/selectedSpotifyPlaylistsAtom"
import CircleStep from "@/components/parts/CircleStep"
import ConnectorContainer from "@/components/parts/ConnectorContainer"
import CheckboxListModal from "@/components/templates/CheckboxListModal"
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
  const theme = useMantineTheme()
  const [
    isPlaylistSelectorOpened,
    { open: onPlaylistSelectorOpen, close: onPlaylistSelectorClose }
  ] = useDisclosure(false)
  const [isFetchingPlaylists, setIsFetchingPlaylists] = useState(false)
  const { redirectUri, getCode } = useSpotifyToken()
  const { getPlaylists } = useSpotifyApi({ initialize: false })
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
      setIsFetchingPlaylists(true)
      const playlists = await getPlaylists()
      setPlaylists(
        playlists.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          imgSrc: item.images[0].url
        }))
      )
      onPlaylistSelectorOpen()
    } catch (e) {
      setErrorModalInstance(prev => [...prev, e])
    } finally {
      setIsFetchingPlaylists(false)
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
    if (selectedPlaylists.length === 0 || playlists.length === 0) return

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
    <ConnectorContainer
      className={className}
      title="Spotifyと接続する"
      iconSrc="/spotify-logo.png"
      onBack={onBack}
    >
      <Flex align="center" gap="xs">
        <CircleStep step={1} color={theme.colors.spotify[5]} />
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
        <CircleStep step={2} color={theme.colors.spotify[5]} />
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
          color={theme.colors.spotify[5]}
          style={{
            display:
              settingState === "setting" || settingState === "done"
                ? "block"
                : "none"
          }} // &&を使うと何故かうまくいかなかったのでインラインスタイルで対応
        />
      </Flex>

      <Flex align="center" gap="xs">
        <CircleStep step={3} color={theme.colors.spotify[5]} />
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
          loading={isFetchingPlaylists}
          disabled={settingState === "none"}
          onClick={handleClickSelectPlaylistButton}
        >
          プレイリストを選択
        </Button>

        <AiFillCheckCircle
          size="1.3rem"
          color={theme.colors.spotify[5]}
          style={{ display: settingState === "done" ? "block" : "none" }}
        />
      </Flex>

      <CheckboxListModal
        opened={isPlaylistSelectorOpened}
        onClose={onPlaylistSelectorClose}
        title="MixJuiceで使用するプレイリストを選択"
        color="spotify"
        items={playlists}
        checkedValues={selectedPlaylists}
        dispath={setSelectedPlaylists}
      />
    </ConnectorContainer>
  )
}

export default memo(SpotifyConnector)
