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
import { useCallback, useEffect, useMemo, useState } from "react"
import { BsClockHistory, BsInfoCircle } from "react-icons/bs"
import { useRecoilValue, useSetRecoilState } from "recoil"
import NavbarCheckbox from "../parts/navbar/NavbarCheckbox"
import NavbarHeading from "../parts/navbar/NavbarHeading"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { musicListAtom } from "@/atoms/musicListAtom"
import { navbarAtom, navbarClassNameAtom } from "@/atoms/navbarAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { NAVBAR_PADDING } from "@/constants/Styling"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSpotifyApi from "@/hooks/useSpotifyApi"
import useSpotifyToken from "@/hooks/useSpotifyToken"
import useTouchDevice from "@/hooks/useTouchDevice"
import { LocalStorageSpotifySelectedPlaylists } from "@/types/LocalStorageSpotifySelectedPlaylists"
import { MusicListItem } from "@/types/MusicListItem"
import { NavbarItem } from "@/types/NavbarItem"
import { Provider } from "@/types/Provider"
import { SpotifyApiTrack } from "@/types/SpotifyApiTrack"

const LayoutNavbar = () => {
  const { isTouchDevice } = useTouchDevice()
  const { breakPoint } = useBreakPoints()
  const navbarWidth = useMemo(() => {
    if (breakPoint === "SmartPhone") return "60%"
    if (breakPoint === "Tablet") return "30%"
    if (breakPoint === "PC") return "20%"
  }, [breakPoint])
  const [isMixing, setIsMixing] = useState(false)
  const isOpened = useRecoilValue(navbarAtom)
  const navbarClassName = useRecoilValue(navbarClassNameAtom)
  const setMusicList = useSetRecoilState(musicListAtom)
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
      provider: "spotify" as Provider,
      id: p.id,
      title: p.title,
      color: "spotify",
      checked: false
    }))

    setPlaylists(prev => [...prev, ...mapped])

    return () => {
      setPlaylists([])
    }
  }, [])

  const handleCheckboxClick = (id: string) => {
    setPlaylists(prev =>
      prev.map(p => (p.id === id ? { ...p, checked: !p.checked } : p))
    )
  }

  const handleCheckboxControllerClick = (to: boolean) => {
    setPlaylists(prev => prev.map(p => ({ ...p, checked: to })))
  }

  const handleProviderCheckboxControllerClick = (
    provider: string,
    to: boolean
  ) => {
    setPlaylists(prev =>
      prev.map(p => (p.provider === provider ? { ...p, checked: to } : p))
    )
  }

  const handleMixButtonClick = useCallback(async () => {
    setIsMixing(true)
    let tracksForPlaylists: MusicListItem[][] = []

    const getPlaylistTracksAsync = async (playlistId: string) => {
      const res = await getPlaylistTracks(playlistId)
      return res.map((item: SpotifyApiTrack) => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists.map(artist => artist.name).join("・"),
        imgSrc: item.track.album.images[0].url
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
      setMusicList(checkedSpotifyPlaylistsTracksFlattenShuffled)
    } catch (e) {
      setErrorModalInstance(prev => [...prev, e])
    } finally {
      setIsMixing(false)
    }
  }, [
    getPlaylistTracks,
    setMusicList,
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
      zIndex={10}
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
                provider="Spotify"
                onClick={handleProviderCheckboxControllerClick}
              />

              <Stack pl="md" py="xs" spacing="sm">
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
              </Stack>
            </Box>
          )}

          {webdavPlaylists.length > 0 && (
            <Box>
              <NavbarHeading
                icon="/server-icon.svg"
                provider="WebDAV"
                onClick={handleProviderCheckboxControllerClick}
              />

              <Stack pl="md" pr="xs" py="xs" spacing="sm">
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
              </Stack>
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

export default LayoutNavbar
