import { Badge, Box, Divider, Flex, Text } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { memo, useCallback } from "react"
import { BsClockHistory } from "react-icons/bs"
import { FixedSizeList } from "react-window"
import ListItem from "@/components/parts/ListItem"
import ListItemContainer from "@/components/parts/ListItemContainer"
import ModalDefault from "@/components/parts/ModalDefault"
import QueueOperator from "@/components/parts/QueueOperator"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { DEFAULT_SETTING_VALUES } from "@/constants/Settings"
import useBreakPoints from "@/hooks/useBreakPoints"
import { SettingValues } from "@/types/DefaultSettings"
import { Track } from "@/types/Track"
import { millisecondsToHoursMinutesSeconds } from "@/utils/millisecondsToHoursMinutesSeconds"
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
  const [settings] = useLocalStorage<SettingValues>({
    key: LOCAL_STORAGE_KEYS.SETTINGS,
    defaultValue: DEFAULT_SETTING_VALUES
  })

  const handleArtworkPlayButtonClick = useCallback(
    async (index: number) => {
      if (settings.CLOSE_MODAL_AUTOMATICALLY_WHEN_TRACK_SELECTED) onClose()
      await onPlayFromPlaybackHistory(index)
    },
    [
      onClose,
      onPlayFromPlaybackHistory,
      settings.CLOSE_MODAL_AUTOMATICALLY_WHEN_TRACK_SELECTED
    ]
  )

  const {
    hours: totalHours,
    minutes: totalMinutes,
    seconds: totalSeconds
  } = millisecondsToHoursMinutesSeconds(
    playbackHistories.reduce((acc, cur) => acc + cur.duration, 0)
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
    >
      <Box data-autoFocus>
        <Flex h="1.3rem" justify="center" align="center">
          {playbackHistories.length > 0 && (
            <>
              <Text w="10rem" fz="0.8rem" fw={700} ta="right">
                {playbackHistories.length}曲
              </Text>
              <Divider mx="xl" orientation="vertical" />
              <Text w="10rem" fz="0.8rem" fw={700} ta="left">
                {totalHours > 0
                  ? `${totalHours}時間${totalMinutes}分${totalSeconds}秒`
                  : totalMinutes > 0
                  ? `${totalMinutes}分${totalSeconds}秒`
                  : `${totalSeconds}秒`}
              </Text>
            </>
          )}
        </Flex>
        {playbackHistories.length > 0 ? (
          <FixedSizeList
            width="100%"
            height={remToPx(28.7)} // ModalDefaultのmax-height(30rem)から再生履歴の合計時間などの表示エリアの高さ(1.3rem)を引いたもの
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
                            breakPoint === "SmartPhone"
                              ? "display"
                              : "visibility"
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
      </Box>
    </ModalDefault>
  )
}

export default memo(PlaybackHistoryModal)
