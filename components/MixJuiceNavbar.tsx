import {
  Flex,
  Navbar,
  Space,
  Stack,
  Title,
  Text,
  ScrollArea
} from "@mantine/core"
import Image from "next/image"
import { BsClockHistory, BsInfoCircle } from "react-icons/bs"
import { useRecoilValue } from "recoil"
import NavbarCheckbox from "./parts/NavbarCheckbox"
import { navbarAtom, navbarClassNameAtom } from "@/atoms/navbarAtom"

const MixJuiceNavbar = () => {
  const isOpened = useRecoilValue(navbarAtom)
  const navbarClassName = useRecoilValue(navbarClassNameAtom)

  /** 表示テスト用 */
  const spotifyPlaylists = [
    { label: "2020", color: "spotify" },
    { label: "2021", color: "spotify" },
    { label: "2022", color: "spotify" },
    { label: "2023", color: "spotify" },
    { label: "すげー長いプレイリストタイトル", color: "spotify" },
    { label: "2020", color: "spotify" },
    { label: "2021", color: "spotify" },
    { label: "2022", color: "spotify" },
    { label: "2023", color: "spotify" },
    { label: "すげー長いプレイリストタイトル", color: "spotify" }
  ]

  const webdavFolders = [
    { label: "/", color: "grape" },
    { label: "/musics", color: "grape" },
    { label: "/subfolder", color: "grape" }
  ]

  return (
    <Navbar
      className={navbarClassName}
      width={{ base: "60%", sm: "30%", lg: "20%" }}
      height="auto" //明示的に指定しないとスクロールエリアの高さが正しく計算されない
      p="sm"
      zIndex={10}
      hiddenBreakpoint="sm"
      hidden={!isOpened}
    >
      <Navbar.Section grow component={ScrollArea}>
        <Flex align="end">
          <Image
            src="/spotify-logo.png"
            height={28}
            width={28}
            alt="spotify logo"
          />
          <Space w="xs" />
          <Title order={3} sx={{ cursor: "default" }} ff="GreycliffCF">
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

        <Space h="xs" />

        <Flex align="center">
          <Image
            src="/server-icon.svg"
            height={28}
            width={28}
            alt="server icon"
          />
          <Space w="xs" />
          <Title order={3} sx={{ cursor: "default" }} ff="GreycliffCF">
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

      <Navbar.Section
        mx="-0.8rem"
        px="sm"
        pt="xs"
        sx={theme => ({ borderTop: `solid 1px ${theme.colors.gray[2]}` })}
      >
        <Flex align="center">
          <BsClockHistory />
          <Space w="xs" />
          <Text weight={600}>再生履歴</Text>
        </Flex>

        <Space h="xs" />

        <Flex align="center">
          <BsInfoCircle />
          <Space w="xs" />
          <Text weight={600}>MixJuiceについて</Text>
        </Flex>
      </Navbar.Section>
    </Navbar>
  )
}

export default MixJuiceNavbar
