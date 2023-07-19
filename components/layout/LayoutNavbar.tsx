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
import { queueAtom } from "@/atoms/queueAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { NAVBAR_PADDING } from "@/constants/Styling"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSpotifyApi from "@/hooks/useSpotifyApi"
import useSpotifyToken from "@/hooks/useSpotifyToken"
import useTouchDevice from "@/hooks/useTouchDevice"
import { LocalStorageSpotifySelectedPlaylists } from "@/types/LocalStorageSpotifySelectedPlaylists"
import { NavbarItem } from "@/types/NavbarItem"
import { Provider } from "@/types/Provider"
import { SpotifyApiTrack } from "@/types/SpotifyApiTrack"
import { Track } from "@/types/Track"

const LayoutNavbar = () => {
  const { isTouchDevice } = useTouchDevice()
  const { breakPoint, isHamburgerMenuVisible } = useBreakPoints()
  const navbarWidth = useMemo(() => {
    if (breakPoint === "SmartPhone") return "60%"
    if (breakPoint === "Tablet") return "30%"
    if (breakPoint === "PC") return "20%"
  }, [breakPoint])
  const [isMixing, setIsMixing] = useState(false)
  const isOpened = useRecoilValue(navbarAtom)
  const navbarClassName = useRecoilValue(navbarClassNameAtom)
  const setQueue = useSetRecoilState(queueAtom)
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const { hasValidAccessTokenState } = useSpotifyToken()
  const { getPlaylistTracks } = useSpotifyApi()

  const [playlists, setPlaylists] = useState<NavbarItem[]>([])
  const spotifyPlaylists = playlists.filter(p => p.provider === "spotify")
  const webdavPlaylists = playlists.filter(p => p.provider === "webdav")

  /** 選択済みSpotifyプレイリスト読み込み */
  useEffect(() => {
    const localStorageSelectedSpotifyPlaylists = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_SELECTED_PLAYLISTS
    )
    if (localStorageSelectedSpotifyPlaylists === null) return

    const parsed = JSON.parse(
      localStorageSelectedSpotifyPlaylists
    ) as LocalStorageSpotifySelectedPlaylists[]

    const mapped: NavbarItem[] = parsed.map(p => ({
      provider: "spotify",
      id: p.id,
      title: p.title,
      color: "spotify",
      checked: false
    }))

    const checkedItems = localStorage.getItem(
      LOCAL_STORAGE_KEYS.NAVBAR_CHECKED_ITEMS
    )
    if (checkedItems !== null) {
      const parsedCheckedItems = JSON.parse(checkedItems) as string[]
      parsedCheckedItems.forEach(id => {
        const index = mapped.findIndex(p => p.id === id)
        if (index !== -1) mapped[index].checked = true
      })
    }

    setPlaylists([
      ...mapped,
      {
        id: "webdav-dir-1",
        color: "webdav",
        provider: "webdav",
        title: "/music",
        checked: false
      },
      {
        id: "webdav-dir-2",
        color: "webdav",
        provider: "webdav",
        title: "/favorites",
        checked: false
      },
      {
        id: "webdav-dir-3",
        color: "webdav",
        provider: "webdav",
        title: "/favorites/subdir",
        checked: false
      }
    ])

    // TODO: WebDAVの引き込みが完了したら→に変更 setPlaylists(mapped)

    return () => {
      setPlaylists([])
    }
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
    /**
     * Safariの『NotAllowedError』対策
     * 参考: https://yukiyuriweb.com/2021/03/12/how-to-handle-notallowederror-in-safari/
     */
    const audio = new Audio("/empty.mp3")
    audio.play().catch(() => undefined)
    audio.pause()

    setIsMixing(true)
    let tracksForPlaylists: Track[][] = []

    const getPlaylistTracksAsync = async (
      playlistId: string
    ): Promise<Track[]> => {
      const res = await getPlaylistTracks(playlistId)
      return res.map((item: SpotifyApiTrack) => ({
        id: item.track.id,
        provider: "spotify",
        title: item.track.name,
        albumTitle: item.track.album.name,
        artist: item.track.artists.map(artist => artist.name).join("・"),
        imgSrc: item.track.album.images[0].url,
        imgHeight: item.track.album.images[0].height,
        imgWidth: item.track.album.images[0].width,
        duration: item.track.duration_ms
      }))
    }

    const selectedPlaylists = spotifyPlaylists.filter(p => p.checked === true)

    try {
      if (hasValidAccessTokenState) {
        console.log("🟦DEBUG: 並列処理でプレイリストの情報を取得します")
        tracksForPlaylists = await Promise.all(
          selectedPlaylists.map(playlist => getPlaylistTracksAsync(playlist.id))
        )
      } else {
        /** アクセストークンがRecoilStateにセットされていない状態で並列処理でリクエストするとトークンの更新処理が何回も走ってしまうので逐次処理でリクエストを行う */
        console.log("🟦DEBUG: 逐次処理でプレイリストの情報を取得します")
        for (const playlist of selectedPlaylists) {
          const tracks = await getPlaylistTracksAsync(playlist.id)
          tracksForPlaylists.push(tracks)
        }
      }

      const checkedSpotifyPlaylistsTracksFlattenShuffled = tracksForPlaylists
        .flat()
        .sort(() => Math.random() - 0.5)
      setQueue(checkedSpotifyPlaylistsTracksFlattenShuffled)
    } catch (e) {
      setErrorModalInstance(prev => [...prev, e])
    } finally {
      setIsMixing(false)
    }
  }, [
    getPlaylistTracks,
    setQueue,
    spotifyPlaylists,
    hasValidAccessTokenState,
    setErrorModalInstance
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
