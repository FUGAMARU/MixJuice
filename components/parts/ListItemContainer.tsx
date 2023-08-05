import { Box } from "@mantine/core"
import { memo } from "react"
import useBreakPoints from "@/hooks/useBreakPoints"

type Props = {
  flex?: boolean
  onClick?: () => void
  children: React.ReactNode
}

const ListItemContainer = ({ flex, onClick, children }: Props) => {
  const { setRespVal } = useBreakPoints()

  return (
    <Box
      display={flex ? "flex" : "block"}
      px={setRespVal("xs", "md", "md")}
      py="xs"
      sx={{
        cursor: "pointer",
        borderRadius: "10px",
        alignItems: "center",
        gap: "1rem",
        transition: "background-color 0.3s ease-out",
        ":hover": { backgroundColor: "#f5f5f5" }
      }}
      onClick={onClick}
    >
      {children}
    </Box>
  )
}

export default memo(ListItemContainer)
