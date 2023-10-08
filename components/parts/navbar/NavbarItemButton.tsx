import { Flex, Space, Text } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { memo, useMemo } from "react"
import useTouchDevice from "@/hooks/useTouchDevice"
import { Children } from "@/types/Children"

type Props = {
  icon: React.ReactNode
  onClick?: () => void | undefined
} & Children

const NavbarItemButton = ({ icon, onClick, children }: Props) => {
  const { isTouchDevice } = useTouchDevice()
  const { hovered, ref } = useHover()
  const transition = useMemo(
    () => (isTouchDevice ? "" : "all .2s ease-in-out"),
    [isTouchDevice]
  )

  return (
    <Flex
      p="0.3rem"
      align="center"
      bg={!isTouchDevice && hovered ? "#f5f5f5" : ""}
      sx={{
        transition,
        cursor: "pointer",
        borderRadius: "5px"
      }}
      onClick={onClick}
      ref={ref}
    >
      {icon}
      <Space w="xs" />
      <Text
        weight={!isTouchDevice && hovered ? 700 : 500}
        sx={{
          transition,
          transform: !isTouchDevice && hovered ? "translateX(-4px)" : ""
        }}
      >
        {children}
      </Text>
    </Flex>
  )
}

export default memo(NavbarItemButton)
