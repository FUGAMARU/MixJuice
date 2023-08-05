import { Flex, Text } from "@mantine/core"
import { memo, useMemo } from "react"
import {
  IoIosArrowBack,
  IoIosArrowDown,
  IoIosArrowForward,
  IoIosArrowUp
} from "react-icons/io"

type Props = {
  direction: "up" | "down" | "left" | "right"
  onClick?: () => void
  children: React.ReactNode
}

const ArrowTextButton = ({ direction, onClick, children }: Props) => {
  const blueColor = useMemo(() => "#228be6", [])
  const iconStyle = useMemo(() => ({ lineHeight: 0 }), [])

  const icon = useMemo(() => {
    switch (direction) {
      case "up":
        return <IoIosArrowUp color={blueColor} style={iconStyle} />
      case "down":
        return <IoIosArrowDown color={blueColor} style={iconStyle} />
      case "left":
        return <IoIosArrowBack color={blueColor} style={iconStyle} />
      case "right":
        return <IoIosArrowForward color={blueColor} style={iconStyle} />
    }
  }, [blueColor, direction, iconStyle])

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
