import {
  DragDropContext,
  Draggable,
  Droppable,
  // eslint-disable-next-line import/named
  DropResult // 存在するのにeslintが認識してくれない
} from "@hello-pangea/dnd"

import { Box, Button, Flex, Paper, Text } from "@mantine/core"
import { useViewportSize } from "@mantine/hooks"
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useMemo,
  useState
} from "react"
import { FixedSizeList } from "react-window"
import { useRecoilCallback } from "recoil"
import { queueAtom } from "@/atoms/queueAtom"
import QueueItem from "@/components/parts/QueueItem"
import { STYLING_VALUES } from "@/constants/StylingValues"
import useBreakPoints from "@/hooks/useBreakPoints"
import useErrorModal from "@/hooks/useErrorModal"
import { greycliffCF } from "@/styles/fonts"
import { Queue } from "@/types/Queue"
import { isDefined } from "@/utils/isDefined"

type Props = {
  queue: Queue[]
  setQueue: Dispatch<SetStateAction<Queue[]>>
  playerHeight: number
  onSkipTo: (queueItem: Queue) => Promise<void>
  onMoveToFront: (trackId: string) => void
  onAddToFront: (trackId: string) => void
  checkCanMoveToFront: (idx: number) => boolean
  checkCanAddToFront: (idx: number, nextPlay: boolean) => boolean
}

const Queue = ({
  queue,
  setQueue,
  playerHeight,
  onSkipTo,
  onMoveToFront,
  onAddToFront,
  checkCanMoveToFront,
  checkCanAddToFront
}: Props) => {
  const { setRespVal, breakPoint } = useBreakPoints()
  const { showError } = useErrorModal()
  const { height: viewportHeight } = useViewportSize()
  const scrollAreaHeight = useMemo(
    () => viewportHeight - STYLING_VALUES.HEADER_HEIGHT - playerHeight,
    [viewportHeight, playerHeight]
  )

  const [pineconeClassNames, setPineconeClassNames] = useState("")
  const handleMiniMixButtonClick = useCallback(async () => {
    if (pineconeClassNames !== "") return

    setPineconeClassNames(
      "animate__animated  animate__faster animate__fadeInDown"
    )
    await new Promise(resolve => setTimeout(resolve, 600))
    setPineconeClassNames(
      "animate__animated  animate__faster animate__slideOutUp"
    )
    await new Promise(resolve => setTimeout(resolve, 600))
    setPineconeClassNames("")
  }, [pineconeClassNames])

  const onDragEnd = useRecoilCallback(
    ({ snapshot, set }) =>
      async (result: DropResult) => {
        if (!isDefined(result.destination)) return

        const currentQueue = await snapshot.getPromise(queueAtom)
        const copiedQueue = [...currentQueue]
        let targetItem = copiedQueue[result.source.index]

        // 移動対象のplayNextがtrue、かつ移動先がキューの先頭ではない、かつ移動先の1つ上のアイテムのplayNextがfalseの場合
        if (
          targetItem.playNext &&
          result.destination.index !== 0 &&
          !copiedQueue[result.destination.index - 1].playNext
        ) {
          targetItem = {
            ...targetItem,
            playNext: false
          }
        }

        // 移動対象のplayNextがfalse、かつ移動先の1つ下のアイテムのplayNextがtrueの場合
        if (
          !targetItem.playNext &&
          copiedQueue[result.destination.index].playNext
        ) {
          targetItem = {
            ...targetItem,
            playNext: true
          }
        }

        copiedQueue.splice(result.source.index, 1)
        copiedQueue.splice(result.destination.index, 0, targetItem)

        set(queueAtom, copiedQueue)
      },
    [setQueue]
  )

  const handleArtworkPlayButtonClick = useCallback(
    async (queueItem: Queue) => {
      try {
        await onSkipTo(queueItem)
      } catch (e) {
        showError(e)
      }
    },
    [onSkipTo, showError]
  )

  return (
    <Box
      h={scrollAreaHeight}
      px={setRespVal("0.5rem", "0.5rem", "1.5rem")}
      pt={`${STYLING_VALUES.QUEUE_PADDING_TOP}px`}
    >
      {queue.length === 0 && (
        <Paper
          w="fit-content"
          mx="auto"
          mt="xs"
          px="1rem"
          py="0.5rem"
          bg="white"
          ta="center"
          shadow="lg"
          radius="xl"
          sx={{ cursor: "default" }}
          pos="relative"
        >
          <Flex
            align="center"
            gap="0.2rem"
            fw={500}
            fz={setRespVal("0.7rem", "0.8rem", "0.8rem")}
          >
            <Text>プレイリストを選択して</Text>
            <Button
              size="xs"
              compact
              ff={greycliffCF.style.fontFamily}
              fw={800}
              variant="gradient"
              gradient={{ from: "#2afadf", to: "#4c83ff" }}
              onClick={handleMiniMixButtonClick}
            >
              MIX!
            </Button>
            <Text>ボタンを押してみましょう！</Text>
          </Flex>

          <Text
            className={pineconeClassNames}
            pos="absolute"
            fz={setRespVal("0.7rem", "0.8rem", "0.8rem")}
            left="36.5%"
            top={pineconeClassNames === "" ? 0 : "110%"}
            ta="center"
            sx={{ zIndex: -1 }}
          >
            \ コンニチワ /
          </Text>
        </Paper>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="queue"
          mode="virtual"
          renderClone={(provided, snapshot, rubric) => {
            const queueItem = queue[rubric.source.index]
            return (
              <QueueItem
                isClone
                provided={provided}
                queueItem={queueItem}
                canMoveToFront={checkCanMoveToFront(rubric.source.index)}
                canAddToFront={checkCanAddToFront(
                  rubric.source.index,
                  queue[rubric.source.index].playNext
                )}
                hiddenMethod={
                  breakPoint === "SmartPhone" ? "display" : "visibility"
                }
              />
            )
          }}
        >
          {provided => (
            <FixedSizeList
              width="100%"
              height={scrollAreaHeight - STYLING_VALUES.QUEUE_PADDING_TOP}
              itemCount={queue.length}
              itemSize={80} // キューのアイテム1つ分の高さ
              innerRef={provided.innerRef}
            >
              {({ index, style }) => {
                const data = queue[index]
                return (
                  <div
                    style={{
                      ...style,
                      paddingLeft: "0.5rem",
                      paddingRight: "0.5rem",
                      borderTop: index !== 0 ? "solid 1px #ced4da" : "none"
                    }}
                  >
                    <Draggable draggableId={data.id} index={index}>
                      {provided => (
                        <QueueItem
                          provided={provided}
                          queueItem={data}
                          onArtworkPlayButtonClick={
                            handleArtworkPlayButtonClick
                          }
                          canMoveToFront={checkCanMoveToFront(index)}
                          canAddToFront={checkCanAddToFront(
                            index,
                            data.playNext
                          )}
                          onMoveToFront={onMoveToFront}
                          onAddToFront={onAddToFront}
                          hiddenMethod={
                            breakPoint === "SmartPhone"
                              ? "display"
                              : "visibility"
                          }
                        />
                      )}
                    </Draggable>
                  </div>
                )
              }}
            </FixedSizeList>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  )
}

export default memo(Queue)
