import { Box, Burger, Flex, Space } from "@mantine/core"
import Image from "next/image"
import { memo, useCallback, useMemo } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"
import { navbarAtom, navbarClassNameAtom } from "@/atoms/navbarAtom"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import { generateRandomNumber } from "@/utils/randomNumberGenerator"

type Props = {
  shouldShowBurger: boolean
}

const LayoutHeader = ({ shouldShowBurger }: Props) => {
  const [isNavbarOpened, setIsNavbarOpened] = useRecoilState(navbarAtom)
  const setNavbarClassName = useSetRecoilState(navbarClassNameAtom)

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

  const headerIndex = useMemo(() => generateRandomNumber(1, 12), []) // メモ化しないとハンバーガーメニューでNavbarを開閉する度にアイコンが変わってしまう

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

        <Image
          src={`/header-logos/header-${headerIndex}.png`}
          width={152}
          height={40}
          alt="Randomized MixJuice Logo"
        />

        <Space w="1.8rem" />
      </Flex>
    </Box>
  )
}

export default memo(LayoutHeader)
