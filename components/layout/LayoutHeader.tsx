import { Box, Burger, Flex, Space } from "@mantine/core"
import Image from "next/image"
import { memo, useCallback, useMemo } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { connectAtom } from "@/atoms/connectAtom"
import { navbarAtom, navbarClassNameAtom } from "@/atoms/navbarAtom"
import { HEADER_HEIGHT, TEXT_COLOR_DEFAULT } from "@/constants/Styling"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import { generateRandomNumber } from "@/utils/randomNumberGenerator"

const LayoutHeader = () => {
  const [isNavbarOpened, setNavbarOpened] = useRecoilState(navbarAtom)
  const setNavbarClassName = useSetRecoilState(navbarClassNameAtom)
  const { breakPoint } = useBreakPoints()
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

  const headerIndex = useMemo(() => generateRandomNumber(1, 12), []) // メモ化しないとハンバーガーメニューでNavbarを開閉する度にアイコンが変わってしまう

  return (
    <Box
      h={HEADER_HEIGHT}
      pos="relative"
      sx={theme => ({
        boxShadow: theme.shadows.sm,
        zIndex: ZINDEX_NUMBERS.HEADER
      })}
    >
      <Flex h="100%" px="lg" align="center" justify="space-between">
        <Box w="1.8rem">
          {!isConnectPage && breakPoint !== "PC" && (
            <Burger
              opened={isNavbarOpened}
              onClick={handleBurgerClick}
              size="sm"
              color={TEXT_COLOR_DEFAULT}
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
