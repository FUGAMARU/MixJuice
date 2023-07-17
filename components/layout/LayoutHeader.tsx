import { Box, Burger, Flex, Header, MediaQuery, Space } from "@mantine/core"
import Image from "next/image"
import { memo, useCallback } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { connectAtom } from "@/atoms/connectAtom"
import { navbarAtom, navbarClassNameAtom } from "@/atoms/navbarAtom"
import { HEADER_HEIGHT, TEXT_COLOR_DEFAULT } from "@/constants/Styling"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import { generateRandomNumber } from "@/utils/randomNumberGenerator"

const LayoutHeader = () => {
  const [isNavbarOpened, setNavbarOpened] = useRecoilState(navbarAtom)
  const setNavbarClassName = useSetRecoilState(navbarClassNameAtom)
  const isConnectPage = useRecoilValue(connectAtom)

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
      height={HEADER_HEIGHT}
      zIndex={ZINDEX_NUMBERS.HEADER}
      sx={theme => ({ boxShadow: theme.shadows.sm })}
    >
      <Flex h="100%" px="lg" align="center" justify="space-between">
        <Box w="1.8rem">
          {!isConnectPage && (
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={isNavbarOpened}
                onClick={handleBurgerClick}
                size="sm"
                color={TEXT_COLOR_DEFAULT}
                mr="xl"
              />
            </MediaQuery>
          )}
        </Box>

        <Image
          src={`/header-logos/header-${generateRandomNumber(1, 12)}.png`}
          width={152}
          height={40}
          alt="Randomized MixJuice Logo"
        />

        <Space w="1.8rem" />
      </Flex>
    </Header>
  )
}

export default memo(LayoutHeader)
