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
import { musicListAtom } from "@/atoms/musicListAtom"
import { navbarAtom, navbarClassNameAtom } from "@/atoms/navbarAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { NAVBAR_PADDING } from "@/constants/Styling"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSpotifyApi from "@/hooks/useSpotifyApi"
import useTouchDevice from "@/hooks/useTouchDevice"
import { LocalStorageSpotifySelectedPlaylists } from "@/types/LocalStorageSpotifySelectedPlaylists"
import { NavbarItem } from "@/types/NavbarItem"

const LayoutNavbar = () => {
  const { isTouchDevice } = useTouchDevice()
  const { breakPoint } = useBreakPoints()
  const navbarWidth = useMemo(() => {
    if (breakPoint === "SmartPhone") return "60%"
    if (breakPoint === "Tablet") return "30%"
    if (breakPoint === "PC") return "20%"
  }, [breakPoint])
  const isOpened = useRecoilValue(navbarAtom)
  const navbarClassName = useRecoilValue(navbarClassNameAtom)
  const { getPlaylistTracks } = useSpotifyApi()

  const [spotifyPlaylists, setSpotifyPlaylists] = useState<NavbarItem[]>([])
  const [webdavPlaylists, setWebdavPlaylists] = useState<NavbarItem[]>([])

  /** 選択済みSpotifyプレイリスト読み込み */
  useEffect(() => {
    const localStorageSelectedSpotifyPlaylists = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_SELECTED_PLAYLISTS
    )
    if (localStorageSelectedSpotifyPlaylists === null) return

    const parsed = JSON.parse(
      localStorageSelectedSpotifyPlaylists
    ) as LocalStorageSpotifySelectedPlaylists[]

    setSpotifyPlaylists(
      parsed.map(p => ({
        id: p.id,
        title: p.title,
        color: "spotify",
        checked: false
      }))
    )
  }, [])

  const handleCheckboxClick = (id: string) => {
    setSpotifyPlaylists(prev =>
      prev.map(p => (p.id === id ? { ...p, checked: !p.checked } : p))
    )
    setWebdavPlaylists(prev =>
      prev.map(p => (p.id === id ? { ...p, checked: !p.checked } : p))
    )
  }

  const handleCheckboxControllerClick = (to: boolean) => {
    setSpotifyPlaylists(prev => prev.map(p => ({ ...p, checked: to })))
    setWebdavPlaylists(prev => prev.map(p => ({ ...p, checked: to })))
  }

  const handleProviderCheckboxControllerClick = (
    provider: string,
    to: boolean
  ) => {
    switch (provider) {
      case "spotify":
        setSpotifyPlaylists(prev => prev.map(p => ({ ...p, checked: to })))
        break
      case "webdav":
        setWebdavPlaylists(prev => prev.map(p => ({ ...p, checked: to })))
        break
    }
  }

  const setMusicList = useSetRecoilState(musicListAtom)
  const handleMixButtonClick = useCallback(async () => {
    const checkedSpotifyPlaylistsTracksFlattenShuffled = await Promise.all(
      spotifyPlaylists
        .filter(p => p.checked === true)
        .map(p => getPlaylistTracks(p.id))
    )
      .then(checkedSpotifyPlaylistsTracks =>
        checkedSpotifyPlaylistsTracks.flat()
      )
      .then(checkedSpotifyPlaylistsTracksFlatten =>
        checkedSpotifyPlaylistsTracksFlatten.sort(() => Math.random() - 0.5)
      )

    setMusicList(checkedSpotifyPlaylistsTracksFlattenShuffled)
  }, [getPlaylistTracks, setMusicList, spotifyPlaylists])

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
            onClick={handleMixButtonClick}
          >
            MIX!
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
