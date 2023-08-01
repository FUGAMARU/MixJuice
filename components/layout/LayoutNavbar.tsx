import {
  Flex,
  Navbar,
  Space,
  Stack,
  Text,
  ScrollArea,
  Input,
  Button,
  Group,
  Box
} from "@mantine/core"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { BsClockHistory, BsInfoCircle } from "react-icons/bs"
import { useRecoilValue, useSetRecoilState } from "recoil"
import NavbarCheckbox from "../parts/navbar/NavbarCheckbox"
import NavbarHeading from "../parts/navbar/NavbarHeading"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { navbarAtom, navbarClassNameAtom } from "@/atoms/navbarAtom"
import { preparingPlaybackAtom } from "@/atoms/preparingPlaybackAtom"
import { queueAtom } from "@/atoms/queueAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { NAVBAR_PADDING } from "@/constants/Styling"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import useMIX from "@/hooks/useMIX"
import useTouchDevice from "@/hooks/useTouchDevice"
import { NavbarItem } from "@/types/NavbarItem"
import { Provider } from "@/types/Provider"
import { convertToNavbarFormat } from "@/utils/convertToNavbarFormat"

const LayoutNavbar = () => {
  const { isTouchDevice } = useTouchDevice()
  const { breakPoint, isHamburgerMenuVisible } = useBreakPoints()
  const navbarWidth = useMemo(() => {
    if (breakPoint === "SmartPhone") return "60%"
    if (breakPoint === "Tablet") return "30%"
    if (breakPoint === "PC") return "20%"
  }, [breakPoint])
  const [isMixing, setIsMixing] = useState(false)
  const setIsPreparingPlayback = useSetRecoilState(preparingPlaybackAtom)
  const isOpened = useRecoilValue(navbarAtom)
  const navbarClassName = useRecoilValue(navbarClassNameAtom)
  const setQueue = useSetRecoilState(queueAtom)
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const { mixAllTracks } = useMIX()

  const [playlists, setPlaylists] = useState<NavbarItem[]>([])
  const spotifyPlaylists = useMemo(
    () => playlists.filter(p => p.provider === "spotify"),
    [playlists]
  )
  const webdavPlaylists = useMemo(
    () => playlists.filter(p => p.provider === "webdav"),
    [playlists]
  )

  /** 選択済みプレイリスト(フォルダー)読み込み */
  useEffect(() => {
    const localStorageSelectedSpotifyPlaylists = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_SELECTED_PLAYLISTS
    )
    const localStorageWebDAVSelectedFolder = localStorage.getItem(
      LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATH
    )

    const spotifyPlaylists = convertToNavbarFormat(
      "spotify",
      localStorageSelectedSpotifyPlaylists
    )
    const webdavFolder = convertToNavbarFormat(
      "webdav",
      localStorageWebDAVSelectedFolder
    )

    let basePlaylists: NavbarItem[] = []

    if (spotifyPlaylists)
      basePlaylists = [...basePlaylists, ...spotifyPlaylists]
    if (webdavFolder) basePlaylists = [...basePlaylists, ...webdavFolder]

    if (basePlaylists.length === 0) return // 読み込むプレイリストが存在しないので以降の処理をする必要はない

    const checkedItems = localStorage.getItem(
      LOCAL_STORAGE_KEYS.NAVBAR_CHECKED_ITEMS
    )

    if (checkedItems !== null) {
      /** 以前にチェックを付けたプレイリスト(フォルダー)は予めチェックを付けておく */
      const parsedCheckedItems = JSON.parse(checkedItems) as string[]
      basePlaylists = basePlaylists.map(p =>
        parsedCheckedItems.includes(p.id) ? { ...p, checked: true } : p
      )
    }

    setPlaylists(basePlaylists)

    return () => setPlaylists([])
  }, [])

  /** チェックを入れた項目をLocalStorageに保存する */
  useEffect(() => {
    if (playlists.length === 0) return

    const checkedItems = playlists
      .filter(p => p.checked === true)
      .map(p => p.id)
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.NAVBAR_CHECKED_ITEMS,
      JSON.stringify(checkedItems)
    )
  }, [playlists])

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

    /**
     * Safariの『NotAllowedError』対策
     * 参考: https://yukiyuriweb.com/2021/03/12/how-to-handle-notallowederror-in-safari/
     */
    const audio = new Audio("/empty.mp3")
    audio.play().catch(() => undefined)
    audio.pause()

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

      setQueue(tracks)
    } catch (e) {
      setErrorModalInstance(prev => [...prev, e])
    } finally {
      setIsMixing(false)
      setIsPreparingPlayback(false)
    }
  }, [
    spotifyPlaylists,
    webdavPlaylists,
    mixAllTracks,
    setQueue,
    setErrorModalInstance,
    setIsPreparingPlayback
  ])

  return (
    <Navbar
      className={navbarClassName}
      width={{ base: navbarWidth }}
      height="auto" //明示的に指定しないとスクロールエリアの高さが正しく計算されない
      p={`${NAVBAR_PADDING}px`}
      zIndex={
        isHamburgerMenuVisible
          ? ZINDEX_NUMBERS.NAVBAR_COLLAPSED
          : ZINDEX_NUMBERS.NAVBAR_EXPANDED
      }
      hiddenBreakpoint="sm"
      hidden={!isOpened}
    >
      <Navbar.Section pb="md">
        <Stack>
          <Input placeholder="🔍 楽曲を検索" />

          <Button
            ff="GreycliffCF"
            fw={800}
            variant="gradient"
            gradient={{ from: "#2afadf", to: "#4c83ff" }}
            sx={{
              transition: "all .2s ease-in-out",
              "&:hover": {
                transform: isTouchDevice ? "" : "scale(1.02)"
              }
            }}
            styles={{
              label: {
                fontSize: "1.1rem",
                letterSpacing: "0.05rem"
              }
            }}
            loading={isMixing}
            onClick={handleMixButtonClick}
          >
            {isMixing ? "MIXING…!" : "MIX!"}
          </Button>

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
              <NavbarHeading
                icon="/spotify-logo.png"
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
                    />
                  )
                })}
              </Box>
            </Box>
          )}

          {webdavPlaylists.length > 0 && (
            <Box>
              <NavbarHeading
                icon="/server-icon.png"
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
        <Flex align="center" sx={{ cursor: "pointer" }}>
          <BsClockHistory />
          <Space w="xs" />
          <Text weight={600}>再生履歴</Text>
        </Flex>

        <Space h="xs" />

        <Flex align="center" sx={{ cursor: "pointer" }}>
          <BsInfoCircle />
          <Space w="xs" />
          <Text weight={600}>MixJuiceについて</Text>
        </Flex>
      </Navbar.Section>
    </Navbar>
  )
}

export default memo(LayoutNavbar)
