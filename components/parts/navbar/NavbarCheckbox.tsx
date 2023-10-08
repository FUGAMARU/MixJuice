import { Checkbox, Flex, Text, useMantineTheme } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { memo, useMemo } from "react"
import useTouchDevice from "@/hooks/useTouchDevice"

type Props = {
  id: string
  label: string
  color: string
  checked: boolean
  onClick: (id: string) => void
  onLabelClick: () => void
}

const NavbarCheckbox = ({
  id,
  label,
  color,
  checked,
  onClick,
  onLabelClick
}: Props) => {
  const theme = useMantineTheme()
  const { isTouchDevice } = useTouchDevice()
  const { hovered, ref } = useHover()
  const transition = useMemo(
    () => (isTouchDevice ? "" : "all .2s ease-in-out"),
    [isTouchDevice]
  )

  return (
    <Flex
      align="center"
      sx={{
        cursor: "pointer"
      }}
      ref={ref}
    >
      <Checkbox
        p="0.4rem"
        checked={checked}
        size="md"
        color={color}
        onChange={() => onClick(id)}
        styles={{
          root: {
            borderTopLeftRadius: "5px",
            borderBottomLeftRadius: "5px",
            transition,
            backgroundColor:
              hovered && !isTouchDevice ? theme.colors[color][0] : ""
          },
          input: {
            cursor: "pointer"
          }
        }}
      />

      <Text
        w="100%"
        p="0.4rem"
        weight={!isTouchDevice && hovered ? 700 : 500}
        lh={1.4}
        bg={hovered && !isTouchDevice ? theme.colors[color][0] : ""}
        sx={{
          borderTopRightRadius: "5px",
          borderBottomRightRadius: "5px",
          transition,
          transform: !isTouchDevice && hovered ? "translateX(-4px)" : "",
          wordBreak: "break-all"
        }}
        onClick={() => onLabelClick()}
      >
        {label}
      </Text>
    </Flex>
  )
}

export default memo(NavbarCheckbox)
