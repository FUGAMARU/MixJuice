import { Flex, Text } from "@mantine/core"
import { memo } from "react"

type Props = {
  step: number
}

const CircleStep = ({ step }: Props) => {
  return (
    <Flex
      w="2rem"
      h="2rem"
      justify="center"
      align="center"
      sx={{
        border: "solid 1px #2ad666",
        borderRadius: "50%",
        flexFlow: "column",
        verticalAlign: "top"
      }}
    >
      <Text
        size="1.2rem"
        lh="2rem"
        ff="GreycliffCF"
        fw={800}
        color="#2ad666"
        sx={{ flex: 1 }}
      >
        {step}
      </Text>
    </Flex>
  )
}

export default memo(CircleStep)
