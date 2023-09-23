import { Box, Center, Flex, Input, Loader, Stack, Text } from "@mantine/core"
import { memo, useCallback, useEffect, useRef } from "react"
import ArrowTextButton from "../../parts/ArrowTextButton"
import ListItem from "../../parts/ListItem"
import ListItemContainer from "../../parts/ListItemContainer"
import ModalDefault from "../../parts/ModalDefault"
import ProviderHeading from "../../parts/ProviderHeading"
import QueueOperator from "../../parts/QueueOperator"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSearch from "@/hooks/useSearch"
import useSpotifySettingState from "@/hooks/useSpotifySettingState"
import useWebDAVSettingState from "@/hooks/useWebDAVSettingState"
import { Track } from "@/types/Track"

type Props = {
  isOpen: boolean
  canMoveToFront: boolean
  canAddToFront: boolean
  onClose: () => void
  onPlayWithTrackInfo: (track: Track) => Promise<void>
  onMoveNewTrackToFront: (track: Track) => void
  onAddNewTrackToFront: (track: Track) => void
}

const SearchModal = ({
  isOpen,
  canMoveToFront,
  canAddToFront,
  onClose,
  onPlayWithTrackInfo,
  onMoveNewTrackToFront,
  onAddNewTrackToFront
}: Props) => {
  const { breakPoint } = useBreakPoints()
  const {
    keyword,
    handleKeywordChange,
    spotifySearchResult,
    showMoreSpotifySearchResult,
    isSearchingSpotify,
    mergedWebDAVSearchResult,
    resetAll
  } = useSearch()
  const { settingState: spotifySettingState } = useSpotifySettingState()
  const { settingState: webDAVSettingState } = useWebDAVSettingState()

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      return
    }

    resetAll()
  }, [isOpen, resetAll])

  const handleArtworkPlayButtonClick = useCallback(
    async (track: Track) => {
      onClose()
      await onPlayWithTrackInfo(track)
      resetAll()
    },
    [onClose, onPlayWithTrackInfo, resetAll]
  )

  return (
    <ModalDefault
      title="🔍 楽曲を検索"
      isOpen={isOpen}
      onClose={onClose}
      withoutCloseButton // 閉じるボタンを非表示にしないとモーダルを開いたときに検索窓にフォーカルが当たらない
    >
      <Input
        placeholder="楽曲タイトルを入力…"
        value={keyword}
        onChange={e => handleKeywordChange(e)}
        ref={inputRef}
      />

      <Stack
        mt="sm"
        pl={breakPoint === "SmartPhone" ? 0 : "0.75rem"}
        spacing="xs"
      >
        {spotifySettingState !== "none" && (
          <Box>
            <Flex mb="xs" align="center" gap="xs">
              <ProviderHeading provider="spotify" />
              {isSearchingSpotify && <Loader color="spotify" size="1.2rem" />}
            </Flex>

            {spotifySearchResult.length > 0 && keyword.length > 0 ? (
              <>
                {spotifySearchResult.map(track => (
                  <ListItemContainer key={track.id}>
                    <Flex
                      align="center"
                      justify="space-between"
                      sx={{ flex: "1", overflow: "hidden" }}
                    >
                      <ListItem
                        image={
                          track.image
                            ? {
                                src: track.image.src,
                                height: track.image.height,
                                width: track.image.width
                              }
                            : undefined
                        }
                        title={track.title}
                        caption={`/ ${track.artist}`}
                        onArtworkPlayButtonClick={() =>
                          handleArtworkPlayButtonClick(track)
                        }
                      />

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
                  </ListItemContainer>
                ))}

                <Center mt="lg">
                  <ArrowTextButton
                    direction="down"
                    onClick={showMoreSpotifySearchResult}
                  >
                    検索結果をもっと見る
                  </ArrowTextButton>
                </Center>
              </>
            ) : (
              <Text ta="center" fz="0.8rem" color="#adadad">
                検索結果はありません
              </Text>
            )}
          </Box>
        )}

        {webDAVSettingState !== "none" && (
          <Box>
            <Flex mb="xs" align="center" gap="xs">
              <ProviderHeading provider="webdav" />
              {mergedWebDAVSearchResult.status !== "IDLE" && (
                <Loader color="webdav" size="1.2rem" />
              )}
            </Flex>

            {mergedWebDAVSearchResult.data.length > 0 && keyword.length > 0 ? (
              <>
                {mergedWebDAVSearchResult.data.map(data => (
                  <ListItemContainer key={data.id}>
                    <Flex
                      align="center"
                      justify="space-between"
                      sx={{ flex: "1", overflow: "hidden" }}
                    >
                      <ListItem
                        image={data.image}
                        title={data.title}
                        caption={data.artist}
                        onArtworkPlayButtonClick={() =>
                          handleArtworkPlayButtonClick(data)
                        }
                      />

                      <QueueOperator
                        canMoveToFront={canMoveToFront}
                        canAddToFront={canAddToFront}
                        onMoveToFront={() => onMoveNewTrackToFront(data)}
                        onAddToFront={() => onAddNewTrackToFront(data)}
                        hiddenMethod={
                          breakPoint === "SmartPhone" ? "display" : "visibility"
                        }
                        animated
                      />
                    </Flex>
                  </ListItemContainer>
                ))}
              </>
            ) : (
              <Text ta="center" fz="0.8rem" color="#adadad">
                検索結果はありません
              </Text>
            )}
          </Box>
        )}
      </Stack>
    </ModalDefault>
  )
}

export default memo(SearchModal)
