import { Flex, Box, Tooltip } from "@mantine/core"
import { memo } from "react"
import { LuListStart, LuListPlus } from "react-icons/lu"
import { TEXT_COLOR_DEFAULT } from "@/constants/Styling"

type Props = {
  canMoveToFront: boolean
  canAddToFront: boolean
  onMoveToFront: () => void
  onAddToFront: () => void
}

const QueueOperator = ({
  canMoveToFront,
  canAddToFront,
  onMoveToFront,
  onAddToFront
}: Props) => {
  return (
    <Flex gap="md">
      <Box
        sx={{
          visibility: canMoveToFront ? "visible" : "hidden"
        }}
      >
        <Tooltip label="キューの先頭に移動">
          <Box>
            <LuListStart
              size="1.3rem"
              color={TEXT_COLOR_DEFAULT}
              style={{ flexShrink: 0, cursor: "pointer" }}
              onClick={onMoveToFront}
            />
          </Box>
        </Tooltip>
      </Box>

      <Box
        sx={{
          visibility: canAddToFront ? "visible" : "hidden"
        }}
      >
        <Tooltip label="キューの先頭に追加">
          <Box>
            <LuListPlus
              size="1.3rem"
              color={TEXT_COLOR_DEFAULT}
              style={{ flexShrink: 0, cursor: "pointer" }}
              onClick={onAddToFront}
            />
          </Box>
        </Tooltip>
      </Box>
    </Flex>
  )
}

export default memo(QueueOperator)
