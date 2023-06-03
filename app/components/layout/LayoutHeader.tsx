import { Box, Burger, Flex, Header, MediaQuery, Space } from "@mantine/core"
import Image from "next/image"
import { useCallback } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"
import { navbarAtom, navbarClassNameAtom } from "@/app/atoms/navbarAtom"

const LayoutHeader: React.FC = () => {
  const [isNavbarOpened, setNavbarOpened] = useRecoilState(navbarAtom)
  const setNavbarClassName = useSetRecoilState(navbarClassNameAtom)

  const handleBurgerClick = useCallback(() => {
    const prefix = "animate__animated animate__faster"
    if (isNavbarOpened) {
      setNavbarClassName(`${prefix} animate__slideOutLeft`)
      setTimeout(() => {
        setNavbarOpened(false)
      }, 400)
    } else {
      setNavbarClassName(`${prefix} animate__slideInLeft`)
      setNavbarOpened(true)
    }
  }, [isNavbarOpened, setNavbarClassName, setNavbarOpened])

  return (
    <Header
      height={50}
      zIndex={999}
      sx={theme => ({ boxShadow: theme.shadows.sm })}
    >
      <Flex h="100%" px="lg" align="center" justify="space-between">
        <Box w="1.8rem">
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={isNavbarOpened}
              onClick={handleBurgerClick}
              size="sm"
              color="#424242"
              mr="xl"
            />
          </MediaQuery>
        </Box>

        <Image
          src="/mix-juice-tmp-logo.png"
          width={152}
          height={40}
          alt="service logo"
        />

        <Space w="1.8rem" />
      </Flex>
    </Header>
  )
}

export default LayoutHeader
