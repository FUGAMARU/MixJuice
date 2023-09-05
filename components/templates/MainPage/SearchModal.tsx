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
import { Track } from "@/types/Track"

type Props = {
  isOpen: boolean
  canMoveToFront: boolean
  canAddToFront: boolean
  onClose: () => void
  onSearchModalPlay: (track: Track) => Promise<void>
  onMoveNewTrackToFront: (track: Track) => void
  onAddNewTrackToFront: (track: Track) => void
}

const SearchModal = ({
  isOpen,
  canMoveToFront,
  canAddToFront,
  onClose,
  onSearchModalPlay,
  onMoveNewTrackToFront,
  onAddNewTrackToFront
}: Props) => {
  const { breakPoint } = useBreakPoints()
  const {
    keyword,
    handleKeywordChange,
    isSpotifyAuthorized,
    isWebDAVAuthorized,
    spotifySearchResult,
    webDAVTrackDatabaseSearchResult,
    showMoreSpotifySearchResult,
    isSearching,
    webDAVSearchResult,
    resetAll
  } = useSearch()

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const handleArtworkPlayButtonClick = useCallback(
    async (track: Track) => {
      await onSearchModalPlay(track)
      onClose()
      resetAll()
    },
    [onClose, onSearchModalPlay, resetAll]
  )

  return (
    <ModalDefault
      title={
        <Flex align="center" gap="sm">
          <Text>🔍 楽曲を検索</Text>
          {isSearching && <Loader color="gray" size="1.2rem" />}
        </Flex>
      }
      isOpen={isOpen}
      onClose={onClose}
      withoutCloseButton
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
        {isSpotifyAuthorized && (
          <Box>
            <Box mb="xs">
              <ProviderHeading
                providerIconSrc="/spotify-logo.png"
                provider="spotify"
              />
            </Box>

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

        {isWebDAVAuthorized && (
          <>
            <Box>
              <Flex mb="xs" align="center" gap="xs">
                <ProviderHeading
                  providerIconSrc="/server-icon.png"
                  provider="webdav"
                />
                <Text fz="0.8rem" color="#adadad">
                  (キャッシュ済み)
                </Text>
              </Flex>

              {webDAVTrackDatabaseSearchResult.length > 0 &&
              keyword.length > 0 ? (
                <>
                  {webDAVTrackDatabaseSearchResult.map(track => (
                    <ListItemContainer key={track.id}>
                      <Box sx={{ flex: "1", overflow: "hidden" }}>
                        <ListItem
                          image={track.image}
                          title={track.title}
                          caption={track.artist}
                          onArtworkPlayButtonClick={() =>
                            handleArtworkPlayButtonClick(track)
                          }
                        />
                      </Box>
                    </ListItemContainer>
                  ))}
                </>
              ) : (
                <Text ta="center" fz="0.8rem" color="#adadad">
                  検索結果はありません
                </Text>
              )}
            </Box>

            <Box>
              <Flex mb="xs" align="center" gap="xs">
                <ProviderHeading
                  providerIconSrc="/server-icon.png"
                  provider="webdav"
                />
                <Text fz="0.8rem" color="#adadad">
                  (未キャッシュ)
                </Text>
              </Flex>

              {webDAVSearchResult.length > 0 && keyword.length > 0 ? (
                <>
                  {webDAVSearchResult.map(track => (
                    <ListItemContainer key={track.id}>
                      <Box sx={{ flex: "1", overflow: "hidden" }}>
                        <ListItem
                          image={track.image}
                          title={track.title}
                          caption={track.artist}
                          onArtworkPlayButtonClick={() =>
                            handleArtworkPlayButtonClick(track)
                          }
                        />
                      </Box>
                    </ListItemContainer>
                  ))}
                </>
              ) : (
                <Text ta="center" fz="0.8rem" color="#adadad">
                  検索結果はありません
                </Text>
              )}
            </Box>
          </>
        )}
      </Stack>
    </ModalDefault>
  )
}

export default memo(SearchModal)
