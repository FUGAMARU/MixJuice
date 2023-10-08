import { Badge, Flex, Text } from "@mantine/core"
import { memo, useCallback } from "react"
import { BsClockHistory } from "react-icons/bs"
import { FixedSizeList } from "react-window"
import ListItem from "@/components/parts/ListItem"
import ListItemContainer from "@/components/parts/ListItemContainer"
import ModalDefault from "@/components/parts/ModalDefault"
import QueueOperator from "@/components/parts/QueueOperator"
import useBreakPoints from "@/hooks/useBreakPoints"
import { Track } from "@/types/Track"
import { remToPx } from "@/utils/remToPx"

type Props = {
  playbackHistories: Track[]
  playbackHistoryIndex: number
  canMoveToFront: boolean
  canAddToFront: boolean
  onPlayFromPlaybackHistory: (index: number) => Promise<void>
  onMoveNewTrackToFront: (track: Track) => void
  onAddNewTrackToFront: (track: Track) => void
  isOpen: boolean
  onClose: () => void
}

const PlaybackHistoryModal = ({
  playbackHistories,
  playbackHistoryIndex,
  canMoveToFront,
  canAddToFront,
  onPlayFromPlaybackHistory,
  onMoveNewTrackToFront,
  onAddNewTrackToFront,
  isOpen,
  onClose
}: Props) => {
  const { breakPoint } = useBreakPoints()

  const handleArtworkPlayButtonClick = useCallback(
    async (index: number) => {
      onClose()
      await onPlayFromPlaybackHistory(index)
    },
    [onClose, onPlayFromPlaybackHistory]
  )

  return (
    <ModalDefault
      title={
        <Flex align="center" gap="xs">
          <BsClockHistory />
          <Text>再生履歴</Text>
        </Flex>
      }
      isOpen={isOpen}
      onClose={onClose}
      withoutCloseButton
    >
      {playbackHistories.length > 0 ? (
        <FixedSizeList
          width="100%"
          height={remToPx(30)}
          itemCount={playbackHistories.length}
          itemSize={80} // キューのアイテム1つ分の高さ
        >
          {({ index, style }) => {
            const track = playbackHistories[index]
            return (
              <div style={style}>
                <ListItemContainer key={track.id}>
                  <Flex
                    align="center"
                    justify="space-between"
                    sx={{ flex: "1", overflow: "hidden" }}
                  >
                    <ListItem
                      image={track.image}
                      title={track.title}
                      caption={track.artist}
                      onArtworkPlayButtonClick={() =>
                        handleArtworkPlayButtonClick(index)
                      }
                    />

                    <Flex
                      align="center"
                      justify="end"
                      gap="xs"
                      sx={{ flex: 1 }}
                    >
                      {index === playbackHistoryIndex && (
                        <Badge color={track.provider} radius="xs">
                          再生中
                        </Badge>
                      )}

                      <QueueOperator
                        canMoveToFront={canMoveToFront}
                        canAddToFront={canAddToFront}
                        onMoveToFront={() => onMoveNewTrackToFront(track)}
                        onAddToFront={() => onAddNewTrackToFront(track)}
                        hiddenMethod={
                          breakPoint === "SmartPhone" ? "display" : "visibility"
                        }
                        animated
                      />
                    </Flex>
                  </Flex>
                </ListItemContainer>
              </div>
            )
          }}
        </FixedSizeList>
      ) : (
        <Text>再生履歴はありません</Text>
      )}
    </ModalDefault>
  )
}

export default memo(PlaybackHistoryModal)
