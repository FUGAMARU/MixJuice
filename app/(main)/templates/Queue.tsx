import { Box, Flex, Text, Tooltip } from "@mantine/core"
import { useViewportSize } from "@mantine/hooks"
import { memo, useCallback, useMemo } from "react"
import { LuListPlus, LuListStart } from "react-icons/lu"
import { FixedSizeList } from "react-window"
import { useRecoilValue } from "recoil"
import { playerHeightAtom } from "@/atoms/playerHeightAtom"
import { queueAtom } from "@/atoms/queueAtom"
import GradientCircle from "@/components/parts/GradientCircle"
import ListItem from "@/components/parts/ListItem"
import { PROVIDER_NAME } from "@/constants/ProviderName"
import {
  HEADER_HEIGHT,
  QUEUE_PADDING_TOP,
  TEXT_COLOR_DEFAULT
} from "@/constants/Styling"
import useBreakPoints from "@/hooks/useBreakPoints"

type Props = {
  onSkipTo: (trackId: string) => Promise<void>
  onMoveToFront: (trackId: string) => void
  onAddToFront: (trackId: string) => void
  checkCanMoveToFront: (idx: number) => boolean
  checkCanAddToFront: (idx: number, nextPlay: boolean) => boolean
}

const Queue = ({
  onSkipTo,
  onMoveToFront,
  onAddToFront,
  checkCanMoveToFront,
  checkCanAddToFront
}: Props) => {
  const { setRespVal } = useBreakPoints()
  const { height: viewportHeight } = useViewportSize()
  const playerHeight = useRecoilValue(playerHeightAtom)
  const scrollAreaHeight = useMemo(
    () => viewportHeight - HEADER_HEIGHT - playerHeight,
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
      pt={`${QUEUE_PADDING_TOP}px`}
    >
      {queue.length === 0 && (
        <Text ta="center" fz={setRespVal("xs", "sm", "sm")}>
          プレイリストを選択して『MIX!』ボタンを押してみましょう！
        </Text>
      )}

      <FixedSizeList
        width="100%"
        height={scrollAreaHeight - QUEUE_PADDING_TOP}
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
                    playable
                    onArtworkPlayButtonClick={() =>
                      handleArtworkPlayButtonClick(data.id)
                    }
                  />
                </Flex>

                <Flex gap="md">
                  <Box
                    sx={{
                      visibility: checkCanMoveToFront(index)
                        ? "visible"
                        : "hidden"
                    }}
                  >
                    <Tooltip label="キューの先頭に移動">
                      <Box>
                        <LuListStart
                          size="1.3rem"
                          color={TEXT_COLOR_DEFAULT}
                          style={{ flexShrink: 0, cursor: "pointer" }}
                          onClick={() => onMoveToFront(data.id)}
                        />
                      </Box>
                    </Tooltip>
                  </Box>

                  <Box
                    sx={{
                      visibility: checkCanAddToFront(index, data.playNext)
                        ? "visible"
                        : "hidden"
                    }}
                  >
                    <Tooltip label="キューの先頭に追加">
                      <Box>
                        <LuListPlus
                          size="1.3rem"
                          color={TEXT_COLOR_DEFAULT}
                          style={{ flexShrink: 0, cursor: "pointer" }}
                          onClick={() => onAddToFront(data.id)}
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                </Flex>
              </Flex>
            </div>
          )
        }}
      </FixedSizeList>
    </Box>
  )
}

export default memo(Queue)
