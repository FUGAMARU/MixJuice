import { Flex, Navbar, Space, Title } from "@mantine/core"
import Image from "next/image"
import { useRecoilValue } from "recoil"
import { navbarAtom, navbarClassNameAtom } from "@/atoms/navbarAtom"

const MixJuiceNavbar = () => {
  const isOpened = useRecoilValue(navbarAtom)
  const navbarClassName = useRecoilValue(navbarClassNameAtom)

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
      </Navbar.Section>
      <Space h="lg" />
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
      </Navbar.Section>
    </Navbar>
  )
}

export default MixJuiceNavbar
