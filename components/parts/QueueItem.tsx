// eslint-disable-next-line import/named
import { DraggableProvided } from "@hello-pangea/dnd" // 存在するのにeslintが認識してくれない
import { Box, Flex } from "@mantine/core"
import { memo } from "react"
import { MdDragIndicator } from "react-icons/md"
import GradientCircle from "./GradientCircle"
import ListItem from "./ListItem"
import QueueOperator from "./QueueOperator"
import { PROVIDER_NAME } from "@/constants/ProviderName"
import { Queue } from "@/types/Queue"

type Props = {
  isClone?: boolean
  provided: DraggableProvided
  queueItem: Queue
  onArtworkPlayButtonClick?: ((queueItem: Queue) => void) | undefined // hello-pangea/dndのrenderCloneで描写するQueueItemではこの関数は不要なのでundefined許容
  canMoveToFront: boolean
  canAddToFront: boolean
  onMoveToFront?: ((trackId: string) => void) | undefined // hello-pangea/dndのrenderCloneで描写するQueueItemではこの関数は不要なのでundefined許容
  onAddToFront?: ((trackId: string) => void) | undefined // hello-pangea/dndのrenderCloneで描写するQueueItemではこの関数は不要なのでundefined許容
  hiddenMethod: "display" | "visibility"
}

const QueueItem = ({
  isClone = false,
  provided,
  queueItem,
  onArtworkPlayButtonClick,
  canMoveToFront,
  canAddToFront,
  onMoveToFront,
  onAddToFront,
  hiddenMethod
}: Props) => {
  return (
    <Flex
      h={isClone ? "auto" : "100%"}
      align="center"
      justify="space-between"
      bg={isClone ? "rgba(255, 255, 255, 0.2)" : undefined}
      sx={{ borderRadius: "10px" }}
      ref={provided.innerRef}
      style={{
        ...provided.draggableProps.style
      }}
      {...provided.draggableProps}
    >
      <Flex align="center" gap="sm" sx={{ overflowX: "hidden" }}>
        <Box {...provided.dragHandleProps} lh={0} sx={{ cursor: "grab" }}>
          <MdDragIndicator size="1.3rem" color="#b5b5b5" />
        </Box>

        <GradientCircle
          color={queueItem.provider}
          tooltipLabel={`${PROVIDER_NAME[queueItem.provider]}の楽曲`}
        />

        <ListItem
          image={queueItem.image}
          title={queueItem.title}
          caption={` / ${queueItem.artist}`}
          onArtworkPlayButtonClick={() =>
            onArtworkPlayButtonClick && onArtworkPlayButtonClick(queueItem)
          }
        />
      </Flex>

      <QueueOperator
        canMoveToFront={canMoveToFront}
        canAddToFront={canAddToFront}
        onMoveToFront={() => onMoveToFront && onMoveToFront(queueItem.id)}
        onAddToFront={() => onAddToFront && onAddToFront(queueItem.id)}
        hiddenMethod={hiddenMethod}
      />
    </Flex>
  )
}

export default memo(QueueItem)
