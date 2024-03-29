import { Box, Center } from "@mantine/core"
import { memo } from "react"
import TooltipDefault from "./TooltipDefault"
import { Provider } from "@/types/Provider"

const COLORS: Record<Provider, { from: string; to: string }> = {
  spotify: {
    from: "#00ff80",
    to: "#00aa40"
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
    <TooltipDefault label={tooltipLabel} withArrow>
      <Center
        w="1.2rem"
        h="1.2rem"
        sx={{
          borderRadius: "50%",
          background: `linear-gradient(45deg, ${COLORS[color].from}, ${COLORS[color].to})`,
          flexShrink: 0
        }}
      >
        <Box
          w="0.7rem"
          h="0.7rem"
          bg={backgroundColor}
          sx={{ borderRadius: "50%" }}
        ></Box>
      </Center>
    </TooltipDefault>
  )
}

export default memo(GradientCircle)
