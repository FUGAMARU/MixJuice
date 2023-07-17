import { Box, Center, Tooltip } from "@mantine/core"
import { Provider } from "@/types/Provider"

const COLORS: Record<Provider, { from: string; to: string }> = {
  spotify: {
    from: "#fff720",
    to: "#3cd500"
  },
  webdav: {
    from: "#2afadf",
    to: "#4c83ff"
  }
}

type Props = {
  color: Provider
  tooltipLabel?: string
  backgroundColor?: string
}

const GradientCircle = ({
  color,
  tooltipLabel = "",
  backgroundColor = "white"
}: Props) => {
  return (
    <Tooltip label={tooltipLabel} fw={700}>
      <Center
        w="1rem"
        h="1rem"
        sx={{
          borderRadius: "50%",
          background: `linear-gradient(45deg, ${COLORS[color].from}, ${COLORS[color].to})`
        }}
      >
        <Box
          w="0.7rem"
          h="0.7rem"
          bg={backgroundColor}
          sx={{ borderRadius: "50%" }}
        ></Box>
      </Center>
    </Tooltip>
  )
}

export default GradientCircle
