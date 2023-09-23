import { Flex, Text } from "@mantine/core"
import { memo } from "react"
import { greycliffCF } from "@/styles/fonts"

type Props = {
  step: number
  color: string
}

const CircleStep = ({ step, color }: Props) => {
  return (
    <Flex
      w="2rem"
      h="2rem"
      justify="center"
      align="center"
      sx={{
        border: `solid 1px ${color}`,
        borderRadius: "50%",
        flexFlow: "column",
        verticalAlign: "top"
      }}
    >
      <Text
        size="1.2rem"
        lh="2rem"
        ff={greycliffCF.style.fontFamily}
        fw={800}
        color={color}
        sx={{ flex: 1 }}
      >
        {step}
      </Text>
    </Flex>
  )
}

export default memo(CircleStep)
