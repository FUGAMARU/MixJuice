import { Button, Flex, Title, useMantineTheme } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useRouter } from "next/navigation"
import { memo, useCallback, useEffect, useState } from "react"
import { AiFillCheckCircle } from "react-icons/ai"
import { useRecoilState, useRecoilValue } from "recoil"
import { selectedSpotifyPlaylistsAtom } from "@/atoms/selectedSpotifyPlaylistsAtom"
import { spotifySettingStateAtom } from "@/atoms/spotifySettingStateAtom"
import CircleStep from "@/components/parts/CircleStep"
import ConnectorContainer from "@/components/parts/ConnectorContainer"
import CheckboxListModal from "@/components/templates/ConnectPage/CheckboxListModal"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { PROVIDER_ICON_SRC } from "@/constants/ProviderIconSrc"
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
  const { getCode } = useSpotifyToken({ initialize: false })
  const { getPlaylists } = useSpotifyApi({ initialize: false })
  const settingState = useRecoilValue(spotifySettingStateAtom)
  const { showError } = useErrorModal()

  const handleSigninButtonClick = useCallback(async () => {
    const args = await getCode()
    router.push(`https://accounts.spotify.com/authorize?${args}`)
  }, [router, getCode])

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
        <CircleStep step={2} color={theme.colors.spotify[5]} />
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
