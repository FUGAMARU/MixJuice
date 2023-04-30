import { Flex, Navbar, Space, Title } from "@mantine/core"
import Image from "next/image"

const MixJuiceNavbar = () => {
  return (
    <Navbar width={{ base: 250 }} p="sm" zIndex={10}>
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
