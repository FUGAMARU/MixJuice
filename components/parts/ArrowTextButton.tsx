import { Flex, Text } from "@mantine/core"
import { memo, useMemo } from "react"
import {
  IoIosArrowBack,
  IoIosArrowDown,
  IoIosArrowForward,
  IoIosArrowUp
} from "react-icons/io"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { Children } from "@/types/Children"

type Props = {
  direction: "up" | "down" | "left" | "right"
  onClick?: () => Promise<void> | void
} & Children

const ArrowTextButton = ({ direction, onClick, children }: Props) => {
  const iconStyle = useMemo(() => ({ lineHeight: 0 }), [])

  const icon = useMemo(() => {
    switch (direction) {
      case "up":
        return (
          <IoIosArrowUp
            color={STYLING_VALUES.TEXT_COLOR_BLUE}
            style={iconStyle}
          />
        )
      case "down":
        return (
          <IoIosArrowDown
            color={STYLING_VALUES.TEXT_COLOR_BLUE}
            style={iconStyle}
          />
        )
      case "left":
        return (
          <IoIosArrowBack
            color={STYLING_VALUES.TEXT_COLOR_BLUE}
            style={iconStyle}
          />
        )
      case "right":
        return (
          <IoIosArrowForward
            color={STYLING_VALUES.TEXT_COLOR_BLUE}
            style={iconStyle}
          />
        )
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
