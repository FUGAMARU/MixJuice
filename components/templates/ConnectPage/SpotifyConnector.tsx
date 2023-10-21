import {
  Box,
  Button,
  Flex,
  Input,
  Title,
  useMantineTheme,
  Text
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChangeEvent, memo, useCallback, useEffect, useState } from "react"
import { AiFillCheckCircle } from "react-icons/ai"
import { BsInfoCircle } from "react-icons/bs"
import { useRecoilState, useRecoilValue } from "recoil"
import { selectedSpotifyPlaylistsAtom } from "@/atoms/selectedSpotifyPlaylistsAtom"
import { spotifySettingStateAtom } from "@/atoms/spotifySettingStateAtom"
import CircleStep from "@/components/parts/CircleStep"
import ConnectorContainer from "@/components/parts/ConnectorContainer"
import CheckboxListModal from "@/components/templates/ConnectPage/CheckboxListModal"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { PROVIDER_ICON_SRC } from "@/constants/ProviderIconSrc"
import { STYLING_VALUES } from "@/constants/StylingValues"
import useErrorModal from "@/hooks/useErrorModal"
import useSpotifyApi from "@/hooks/useSpotifyApi"
import useSpotifyToken from "@/hooks/useSpotifyToken"
import useStorage from "@/hooks/useStorage"
import styles from "@/styles/SpotifyConnector.module.css"
import { ListItemDetail } from "@/types/ListItemDetail"
import { LocalStorageSpotifySelectedPlaylists } from "@/types/LocalStorageSpotifySelectedPlaylists"
import { isDefined } from "@/utils/isDefined"

type Props = {
  className?: string
  onBack: () => void
}

const SpotifyConnector = ({ className, onBack }: Props) => {
  const router = useRouter()
  const { getUserData, updateUserData } = useStorage({ initialize: false })
  const theme = useMantineTheme()
  const [
    isPlaylistSelectorOpened,
    { open: onPlaylistSelectorOpen, close: onPlaylistSelectorClose }
  ] = useDisclosure(false)
  const [isFetchingPlaylists, setIsFetchingPlaylists] = useState(false)
  const { redirectUri, getCode } = useSpotifyToken({ initialize: false })
  const { getPlaylists } = useSpotifyApi({ initialize: false })
  const settingState = useRecoilValue(spotifySettingStateAtom)
  const { showError } = useErrorModal()

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

  const [playlists, setPlaylists] = useState<ListItemDetail[]>([])
  const handleClickSelectPlaylistButton = useCallback(async () => {
    try {
      setIsFetchingPlaylists(true)
      const playlists = await getPlaylists()
      setPlaylists(
        playlists.map(item => ({
          id: item.id,
          image: {
            src: item.images[0].url,
            height: item.images[0].height,
            width: item.images[0].width
          },
          title: item.name,
          caption: item.description
        }))
      )
      onPlaylistSelectorOpen()
    } catch (e) {
      showError(e)
    } finally {
      setIsFetchingPlaylists(false)
    }
  }, [getPlaylists, onPlaylistSelectorOpen, showError])

  /** 遷移してきた時に過去に選択したプレイリストにチェックを入れておき、プレイリストが選択される度にlocalStorageを更新する */
  const [selectedPlaylists, setSelectedPlaylists] = useRecoilState(
    selectedSpotifyPlaylistsAtom
  )
  useEffect(() => {
    ;(async () => {
      const localStorageSelectedPlaylists = await getUserData(
        FIRESTORE_DOCUMENT_KEYS.SPOTIFY_SELECTED_PLAYLISTS
      )

      if (!isDefined(localStorageSelectedPlaylists)) return

      const parsed = JSON.parse(
        localStorageSelectedPlaylists
      ) as LocalStorageSpotifySelectedPlaylists[]

      setSelectedPlaylists(parsed.map(obj => obj.id))
    })()
  }, [setSelectedPlaylists, getUserData])

  useEffect(() => {
    ;(async () => {
      if (selectedPlaylists.length === 0 || playlists.length === 0) return

      const linkedSelectedPlaylists: LocalStorageSpotifySelectedPlaylists[] =
        selectedPlaylists.map(id => {
          const item = playlists.find(obj => obj.id === id)
          return {
            id: id,
            title: item?.title || ""
          }
        })

      await updateUserData(
        FIRESTORE_DOCUMENT_KEYS.SPOTIFY_SELECTED_PLAYLISTS,
        JSON.stringify(linkedSelectedPlaylists)
      )
    })()
  }, [selectedPlaylists, playlists, updateUserData])

  return (
    <ConnectorContainer
      className={className}
      title="Spotifyと接続する"
      iconSrc={PROVIDER_ICON_SRC["spotify"]}
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

        <Box mt="0.3rem" pl="2rem" fz="xs" color="#575757">
          <Flex align="center" gap="0.2rem">
            <BsInfoCircle size="1rem" color="#575757" />

            <Text>
              ClientIDの取得方法は
              <Link
                href="https://developer.spotify.com/documentation/web-api/concepts/apps"
                style={{ color: STYLING_VALUES.TEXT_COLOR_BLUE }}
                target="_blank"
                rel="noopener noreferrer"
              >
                こちら
              </Link>
            </Text>
          </Flex>

          <Flex pl="1.2rem" ta="left" align="center" gap="xs">
            <Text>Redirect URIs:</Text>
            <Input
              value={`${window.location.origin}/callback/spotify`}
              size="1rem"
              variant="filled"
              style={{ flex: 1 }}
              styles={{
                input: {
                  fontSize: "0.75rem"
                }
              }}
            />
          </Flex>
        </Box>
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
        isOpen={isPlaylistSelectorOpened}
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
