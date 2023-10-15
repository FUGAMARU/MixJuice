import { Box, Center } from "@mantine/core"
import { memo } from "react"
import { Children } from "@/types/Children"

type Props = {
  h: string | undefined
  w: string | undefined
} & Children

const CardViewDefault = ({ h, w, children }: Props) => {
  return (
    <Center h="100%">
      <Box
        h={h}
        w={w}
        px="xl"
        py="md"
        bg="white"
        ta="center"
        sx={{
          border: "solid 1px rgba(0, 0, 0, 0.1)",
          borderRadius: "5px",
          overflow: "hidden"
        }}
      >
        {children}
      </Box>
    </Center>
  )
}

export default memo(CardViewDefault)
