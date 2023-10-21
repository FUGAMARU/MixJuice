import {
  Navbar,
  Stack,
  Input,
  Button,
  Group,
  Box,
  Kbd,
  ScrollArea
} from "@mantine/core"
import { useHotkeys } from "@mantine/hooks"
import { useRouter } from "next/navigation"
import {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react"
import { BiSearchAlt } from "react-icons/bi"
import { BsClockHistory, BsInfoCircle } from "react-icons/bs"
import { GrConnect } from "react-icons/gr"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import GradientButton from "../parts/GradientButton"
import ProviderHeading from "../parts/ProviderHeading"
import NavbarCheckbox from "../parts/navbar/NavbarCheckbox"
import NavbarItemButton from "../parts/navbar/NavbarItemButton"
import { loadingAtom } from "@/atoms/loadingAtom"
import { navbarAtom, navbarClassNameAtom } from "@/atoms/navbarAtom"
import { searchModalAtom } from "@/atoms/searchModalAtom"
import { userDataAtom } from "@/atoms/userDataAtom"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { STYLING_VALUES } from "@/constants/StylingValues"
import useErrorModal from "@/hooks/useErrorModal"
import useMIX from "@/hooks/useMIX"
import useStorage from "@/hooks/useStorage"
import { NavbarItem } from "@/types/NavbarItem"
import { Provider } from "@/types/Provider"
import { Queue } from "@/types/Queue"
import { Track } from "@/types/Track"
import { convertToNavbarFormat } from "@/utils/convertToNavbarFormat"
import { isDefined } from "@/utils/isDefined"

type Props = {
  height: string
  setQueue: Dispatch<SetStateAction<Queue[]>>
  isPlaying: boolean
  canSlideNavbar: boolean
  onPlay: (track: Track) => Promise<void>
  onCheckboxLabelClick: (
    provider: Provider,
    id: string,
    title: string
  ) => Promise<void>
  onPlaybackHistoryModalOpen: () => void
  setIsPreparingPlayback: Dispatch<SetStateAction<boolean>>
}

const LayoutNavbar = ({
  height,
  setQueue,
  isPlaying,
  canSlideNavbar,
  onPlay,
  onCheckboxLabelClick,
  onPlaybackHistoryModalOpen,
  setIsPreparingPlayback
}: Props) => {
  const router = useRouter()
  const setIsLoading = useSetRecoilState(loadingAtom)
  const { getUserData } = useStorage({ initialize: false })
  const userData = useRecoilValue(userDataAtom)
  const [isMixing, setIsMixing] = useState(false)
  const [navbarClassName, setNavbarClassName] =
    useRecoilState(navbarClassNameAtom)
  const [isOpened, setIsOpened] = useRecoilState(navbarAtom)
  const { showError } = useErrorModal()
  const { mixAllTracks } = useMIX()
  const setIsSearchModalOpen = useSetRecoilState(searchModalAtom)
  useHotkeys([
    ["Slash", () => setIsSearchModalOpen(true)],
    ["mod+K", () => setIsSearchModalOpen(true)]
  ])

  // TODO: LayoutHeaderにあるLayoutNavbarを閉じるロジックと全く同じだから共通化したい
  const closeOwn = useCallback(() => {
    const prefix = "animate__animated animate__faster"
    if (isOpened) {
      setNavbarClassName(`${prefix} animate__slideOutLeft`)
      setTimeout(() => {
        setIsOpened(false)
      }, 400)
    } else {
      setNavbarClassName(`${prefix} animate__slideInLeft`)
      setIsOpened(true)
    }
  }, [isOpened, setNavbarClassName, setIsOpened])

  const [playlists, setPlaylists] = useState<NavbarItem[]>([])
  const spotifyPlaylists = useMemo(
    () => playlists.filter(p => p.provider === "spotify"),
    [playlists]
  )
  const webdavPlaylists = useMemo(
    () => playlists.filter(p => p.provider === "webdav"),
    [playlists]
  )

  const checkedItems = useMemo(
    () => playlists.filter(p => p.checked === true),
    [playlists]
  )

  /** 選択済みプレイリスト(フォルダー)読み込み */
  useEffect(() => {
    ;(async () => {
      if (!isDefined(userData)) return

      const localStorageSelectedSpotifyPlaylists = await getUserData(
        FIRESTORE_DOCUMENT_KEYS.SPOTIFY_SELECTED_PLAYLISTS
      )
      const localStorageWebDAVSelectedFolders = localStorage.getItem(
        LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS
      )

      const spotifyPlaylists = convertToNavbarFormat(
        "spotify",
        localStorageSelectedSpotifyPlaylists
      )
      const webdavFolder = convertToNavbarFormat(
        "webdav",
        localStorageWebDAVSelectedFolders
      )

      let basePlaylists: NavbarItem[] = []

      if (spotifyPlaylists)
        basePlaylists = [...basePlaylists, ...spotifyPlaylists]
      if (webdavFolder) basePlaylists = [...basePlaylists, ...webdavFolder]

      if (basePlaylists.length === 0) return // 読み込むプレイリストが存在しないので以降の処理をする必要はない

      const localStorageCheckedItems = localStorage.getItem(
        LOCAL_STORAGE_KEYS.NAVBAR_CHECKED_ITEMS
      )

      if (localStorageCheckedItems !== null) {
        /** 以前にチェックを付けたプレイリスト(フォルダー)は予めチェックを付けておく */
        const parsedCheckedItems = JSON.parse(
          localStorageCheckedItems
        ) as NavbarItem[]

        basePlaylists = basePlaylists.map(item => ({
          ...item,
          ...parsedCheckedItems.find(checkedItem => checkedItem.id === item.id)
        }))
      }

      setPlaylists(basePlaylists)
    })()

    return () => setPlaylists([])
  }, [getUserData, userData])

  /** チェックを入れた項目をLocalStorageに保存する */
  useEffect(() => {
    if (playlists.length === 0) return

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.NAVBAR_CHECKED_ITEMS,
      JSON.stringify(checkedItems)
    )
  }, [playlists, checkedItems])

  const handleCheckboxClick = useCallback((id: string) => {
    setPlaylists(prev =>
      prev.map(p => (p.id === id ? { ...p, checked: !p.checked } : p))
    )
  }, [])

  const handleCheckboxControllerClick = useCallback((to: boolean) => {
    setPlaylists(prev => prev.map(p => ({ ...p, checked: to })))
  }, [])

  const handleProviderCheckboxControllerClick = useCallback(
    (provider: Provider, to: boolean) => {
      setPlaylists(prev =>
        prev.map(p => (p.provider === provider ? { ...p, checked: to } : p))
      )
    },
    []
  )

  const handleMixButtonClick = useCallback(async () => {
    setIsMixing(true)
    setIsPreparingPlayback(true)

    const checkedSpotifyPlaylists = spotifyPlaylists.filter(
      p => p.checked === true
    )
    const checkedWebDAVPlaylists = webdavPlaylists.filter(
      p => p.checked === true
    )

    try {
      const tracks = await mixAllTracks(
        checkedSpotifyPlaylists,
        checkedWebDAVPlaylists
      )

      if (tracks.length === 0) return // 読み込む曲が存在しないので以降の処理をする必要はない

      if (!isPlaying) {
        await onPlay(tracks[0])
        tracks.shift()
      }

      setQueue(
        tracks.map(track => ({
          ...track,
          playNext: false
        }))
      )

      if (canSlideNavbar) closeOwn()
    } catch (e) {
      showError(e)
    } finally {
      setIsMixing(false)
      setIsPreparingPlayback(false)
    }
  }, [
    spotifyPlaylists,
    webdavPlaylists,
    mixAllTracks,
    setQueue,
    showError,
    setIsPreparingPlayback,
    isPlaying,
    onPlay,
    canSlideNavbar,
    closeOwn
  ])

  return (
    <Navbar
      className={navbarClassName}
      width={{ base: "100%" }}
      height={height} // 100%だとスクロールが効かなくなる
      p={`${STYLING_VALUES.NAVBAR_PADDING}px`}
      hidden={!isOpened}
    >
      <Navbar.Section pb="md">
        <Stack>
          <Input
            icon={<BiSearchAlt size="1.3rem" style={{ lineHeight: 0 }} />}
            rightSection={<Kbd lh={1}>/</Kbd>}
            placeholder="楽曲を検索"
            onClick={() => setIsSearchModalOpen(true)}
          />

          <GradientButton
            size="sm"
            ff="greycliffCF"
            fz="1.1rem"
            fw={800}
            letterSpacing="0.1rem"
            disabled={checkedItems.length === 0}
            loading={isMixing}
            onClick={handleMixButtonClick}
          >
            {isMixing ? "MIXING…!" : "MIX!"}
          </GradientButton>

          <Group grow position="center">
            <Button
              variant="light"
              color="gray"
              onClick={() => handleCheckboxControllerClick(true)}
            >
              全選択
            </Button>
            <Button
              variant="light"
              color="gray"
              onClick={() => handleCheckboxControllerClick(false)}
            >
              全解除
            </Button>
          </Group>
        </Stack>
      </Navbar.Section>

      <Navbar.Section grow component={ScrollArea}>
        <Stack spacing="xs">
          {spotifyPlaylists.length > 0 && (
            <Box>
              <ProviderHeading
                provider="spotify"
                onClick={handleProviderCheckboxControllerClick}
              />

              <Box pl="md" py="xs">
                {spotifyPlaylists.map((p, idx) => {
                  return (
                    <NavbarCheckbox
                      key={idx}
                      id={p.id}
                      label={p.title}
                      checked={p.checked}
                      color={p.color}
                      onClick={handleCheckboxClick}
                      onLabelClick={() =>
                        onCheckboxLabelClick(p.provider, p.id, p.title)
                      }
                    />
                  )
                })}
              </Box>
            </Box>
          )}

          {webdavPlaylists.length > 0 && (
            <Box>
              <ProviderHeading
                provider="webdav"
                onClick={handleProviderCheckboxControllerClick}
              />

              <Box pl="md" py="xs">
                {webdavPlaylists.map((p, idx) => {
                  return (
                    <NavbarCheckbox
                      key={idx}
                      id={p.id}
                      label={p.title}
                      checked={p.checked}
                      color={p.color}
                      onClick={handleCheckboxClick}
                      onLabelClick={() =>
                        onCheckboxLabelClick(p.provider, p.id, p.title)
                      }
                    />
                  )
                })}
              </Box>
            </Box>
          )}
        </Stack>
      </Navbar.Section>

      <Navbar.Section
        mx="-0.8rem"
        px="sm"
        pt="xs"
        sx={theme => ({ borderTop: `solid 1px ${theme.colors.gray[2]}` })}
      >
        <Box>
          <NavbarItemButton
            icon={<BsClockHistory />}
            onClick={onPlaybackHistoryModalOpen}
          >
            再生履歴
          </NavbarItemButton>

          <NavbarItemButton
            icon={<GrConnect />}
            onClick={async () => {
              setIsLoading({
                stateChangedOn: "MainPage",
                state: true
              })
              await new Promise(resolve => setTimeout(resolve, 300))
              router.push("/connect")
            }}
          >
            サービス接続設定
          </NavbarItemButton>

          <NavbarItemButton icon={<BsInfoCircle />}>
            MixJuiceについて
          </NavbarItemButton>
        </Box>
      </Navbar.Section>
    </Navbar>
  )
}

export default memo(LayoutNavbar)
