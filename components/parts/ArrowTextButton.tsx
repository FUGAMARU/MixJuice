import { Flex, Text } from "@mantine/core"
import { memo, useMemo } from "react"
import {
  IoIosArrowBack,
  IoIosArrowDown,
  IoIosArrowForward,
  IoIosArrowUp
} from "react-icons/io"
import { TEXT_COLOR_BLUE } from "@/constants/Styling"

type Props = {
  direction: "up" | "down" | "left" | "right"
  onClick?: () => void
  children: React.ReactNode
}

const ArrowTextButton = ({ direction, onClick, children }: Props) => {
  const iconStyle = useMemo(() => ({ lineHeight: 0 }), [])

  const icon = useMemo(() => {
    switch (direction) {
      case "up":
        return <IoIosArrowUp color={TEXT_COLOR_BLUE} style={iconStyle} />
      case "down":
        return <IoIosArrowDown color={TEXT_COLOR_BLUE} style={iconStyle} />
      case "left":
        return <IoIosArrowBack color={TEXT_COLOR_BLUE} style={iconStyle} />
      case "right":
        return <IoIosArrowForward color={TEXT_COLOR_BLUE} style={iconStyle} />
    }
  }, [direction, iconStyle])

  return (
    <Flex
      align="center"
      onClick={onClick}
      sx={{ cursor: "pointer" }}
      direction={direction === "right" ? "row-reverse" : "row"}
    >
      {icon}
      <Text size="0.8rem" color="blue">
        {children}
      </Text>
    </Flex>
  )
}

export default memo(ArrowTextButton)
