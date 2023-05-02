import { Flex, Navbar, Space, Stack, Title } from "@mantine/core"
import Image from "next/image"
import { useRecoilValue } from "recoil"
import NavbarCheckbox from "./parts/NavbarCheckbox"
import { navbarAtom, navbarClassNameAtom } from "@/atoms/navbarAtom"

const MixJuiceNavbar = () => {
  const isOpened = useRecoilValue(navbarAtom)
  const navbarClassName = useRecoilValue(navbarClassNameAtom)

  /** 表示テスト用 */
  const spotifyPlaylists = [
    { label: "2020", color: "green" },
    { label: "2021", color: "green" },
    { label: "2022", color: "green" },
    { label: "2023", color: "green" },
    { label: "すげー長いプレイリストタイトル", color: "green" }
  ]

  const webdavFolders = [
    { label: "/", color: "grape" },
    { label: "/musics", color: "grape" },
    { label: "/subfolder", color: "grape" }
  ]

  return (
    <Navbar
      className={navbarClassName}
      width={{ base: 200, md: 250 }}
      p="sm"
      zIndex={10}
      hiddenBreakpoint="sm"
      hidden={!isOpened}
    >
      <Navbar.Section>
        <Flex align="end">
          <Image
            src="/spotify-logo.png"
            height={28}
            width={28}
            alt="spotify logo"
          />
          <Space w="xs" />
          <Title order={3} sx={{ cursor: "default" }}>
            Spotify
          </Title>
        </Flex>

        <Stack pl="md" py="xs" spacing="sm">
          {spotifyPlaylists.map((playlist, idx) => {
            return (
              <NavbarCheckbox
                key={idx}
                label={playlist.label}
                color={playlist.color}
              />
            )
          })}
        </Stack>
      </Navbar.Section>

      <Space h="xs" />

      <Navbar.Section>
        <Flex align="center">
          <Image
            src="/server-icon.svg"
            height={28}
            width={28}
            alt="server icon"
          />
          <Space w="xs" />
          <Title order={3} sx={{ cursor: "default" }}>
            WebDav
          </Title>
        </Flex>

        <Stack pl="md" pr="xs" py="xs" spacing="sm">
          {webdavFolders.map((folder, idx) => {
            return (
              <NavbarCheckbox
                key={idx}
                label={folder.label}
                color={folder.color}
              />
            )
          })}
        </Stack>
      </Navbar.Section>
    </Navbar>
  )
}

export default MixJuiceNavbar
