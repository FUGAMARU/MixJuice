import { Box, Burger, Flex, Space } from "@mantine/core"
import Image from "next/image"
import { memo, useCallback } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import { navbarAtom, navbarClassNameAtom } from "@/atoms/navbarAtom"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"

type Props = {
  shouldShowBurger: boolean
}

const LayoutHeader = ({ shouldShowBurger }: Props) => {
  const [isNavbarOpened, setIsNavbarOpened] = useRecoilState(navbarAtom)
  const setNavbarClassName = useSetRecoilState(navbarClassNameAtom)
  const faviconIndex = useRecoilValue(faviconIndexAtom)

  const handleBurgerClick = useCallback(() => {
    const prefix = "animate__animated animate__faster"
    if (isNavbarOpened) {
      setNavbarClassName(`${prefix} animate__slideOutLeft`)
      setTimeout(() => {
        setIsNavbarOpened(false)
      }, 400)
    } else {
      setNavbarClassName(`${prefix} animate__slideInLeft`)
      setIsNavbarOpened(true)
    }
  }, [isNavbarOpened, setNavbarClassName, setIsNavbarOpened])

  return (
    <Box
      h={STYLING_VALUES.HEADER_HEIGHT}
      pos="relative"
      sx={theme => ({
        boxShadow: theme.shadows.sm,
        zIndex: ZINDEX_NUMBERS.HEADER
      })}
    >
      <Flex h="100%" px="lg" align="center" justify="space-between">
        <Box w="1.8rem">
          {shouldShowBurger && (
            <Burger
              opened={isNavbarOpened}
              onClick={handleBurgerClick}
              size="sm"
              color={STYLING_VALUES.TEXT_COLOR_DEFAULT}
              mr="xl"
            />
          )}
        </Box>

        {faviconIndex && (
          <Image
            src={`/header-logos/header-${faviconIndex}.png`}
            width={152}
            height={40}
            alt="Randomized MixJuice Logo"
          />
        )}

        <Space w="1.8rem" />
      </Flex>
    </Box>
  )
}

export default memo(LayoutHeader)
