import { Box, Flex, Text } from "@mantine/core"
import { useViewportSize } from "@mantine/hooks"
import { memo, useCallback, useMemo } from "react"
import { FixedSizeList } from "react-window"
import { useRecoilValue } from "recoil"
import { queueAtom } from "@/atoms/queueAtom"
import GradientCircle from "@/components/parts/GradientCircle"
import ListItem from "@/components/parts/ListItem"
import QueueOperator from "@/components/parts/QueueOperator"
import { PROVIDER_NAME } from "@/constants/ProviderName"
import { STYLING_VALUES } from "@/constants/StylingValues"
import useBreakPoints from "@/hooks/useBreakPoints"

type Props = {
  playerHeight: number
  onSkipTo: (trackId: string) => Promise<void>
  onMoveToFront: (trackId: string) => void
  onAddToFront: (trackId: string) => void
  checkCanMoveToFront: (idx: number) => boolean
  checkCanAddToFront: (idx: number, nextPlay: boolean) => boolean
}

const Queue = ({
  playerHeight,
  onSkipTo,
  onMoveToFront,
  onAddToFront,
  checkCanMoveToFront,
  checkCanAddToFront
}: Props) => {
  const { setRespVal } = useBreakPoints()
  const { height: viewportHeight } = useViewportSize()
  const scrollAreaHeight = useMemo(
    () => viewportHeight - STYLING_VALUES.HEADER_HEIGHT - playerHeight,
    [viewportHeight, playerHeight]
  )
  const queue = useRecoilValue(queueAtom)

  const handleArtworkPlayButtonClick = useCallback(
    async (id: string) => {
      await onSkipTo(id)
    },
    [onSkipTo]
  )

  return (
    <Box
      h={scrollAreaHeight}
      px={setRespVal("0.5rem", "0.5rem", "1.5rem")}
      pt={`${STYLING_VALUES.QUEUE_PADDING_TOP}px`}
    >
      {queue.length === 0 && (
        <Text ta="center" fz={setRespVal("xs", "sm", "sm")}>
          プレイリストを選択して『MIX!』ボタンを押してみましょう！
        </Text>
      )}

      <FixedSizeList
        width="100%"
        height={scrollAreaHeight - STYLING_VALUES.QUEUE_PADDING_TOP}
        itemCount={queue.length}
        itemSize={80} // キューのアイテム1つ分の高さ
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
              <Flex h="100%" align="center" justify="space-between">
                <Flex align="center" gap="sm" sx={{ overflowX: "hidden" }}>
                  <GradientCircle
                    color={data.provider}
                    tooltipLabel={`${PROVIDER_NAME[data.provider]}の楽曲`}
                  />

                  <ListItem
                    image={data.image}
                    title={data.title}
                    caption={` / ${data.artist}`}
                    onArtworkPlayButtonClick={() =>
                      handleArtworkPlayButtonClick(data.id)
                    }
                  />
                </Flex>

                <QueueOperator
                  canMoveToFront={checkCanMoveToFront(index)}
                  canAddToFront={checkCanAddToFront(index, data.playNext)}
                  onMoveToFront={() => onMoveToFront(data.id)}
                  onAddToFront={() => onAddToFront(data.id)}
                />
              </Flex>
            </div>
          )
        }}
      </FixedSizeList>
    </Box>
  )
}

export default memo(Queue)
