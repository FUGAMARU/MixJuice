import { Box, Loader, Paper } from "@mantine/core"
import { memo } from "react"
import { Children } from "@/types/Children"

type Props = {
  cursor: "default" | "pointer"
  loading?: boolean
  onClick?: () => void
} & Children

const PlaybackStateBadge = ({ cursor, loading, onClick, children }: Props) => {
  return (
    <Paper
      px="0.5rem"
      py="0.3rem"
      opacity={0.8}
      fz="0.8rem"
      fw={700}
      shadow="lg"
      radius="sm"
      sx={{
        backdropFilter: "blue(10px)",
        cursor
      }}
      onClick={onClick}
    >
      {loading ? (
        <Box lh={0}>
          <Loader color="gray" size="1.2rem" />
        </Box>
      ) : (
        children
      )}
    </Paper>
  )
}

export default memo(PlaybackStateBadge)
