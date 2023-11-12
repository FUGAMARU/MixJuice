import { Box, Center, Flex, Input, Loader, Stack, Text } from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { memo, useCallback, useEffect } from "react"
import { useRecoilValue } from "recoil"
import ArrowTextButton from "../../parts/ArrowTextButton"
import ListItem from "../../parts/ListItem"
import ListItemContainer from "../../parts/ListItemContainer"
import ModalDefault from "../../parts/ModalDefault"
import ProviderHeading from "../../parts/ProviderHeading"
import QueueOperator from "../../parts/QueueOperator"
import { spotifySettingStateAtom } from "@/atoms/spotifySettingStateAtom"
import { webDAVSettingStateAtom } from "@/atoms/webDAVSettingStateAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { DEFAULT_SETTING_VALUES } from "@/constants/Settings"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSearch from "@/hooks/useSearch"
import { SettingValues } from "@/types/DefaultSettings"
import { Track } from "@/types/Track"

type Props = {
  isOpen: boolean
  canMoveToFront: boolean
  canAddToFront: boolean
  onClose: () => void
  onPlay: (track: Track) => Promise<void>
  onMoveNewTrackToFront: (track: Track) => void
  onAddNewTrackToFront: (track: Track) => void
}

const SearchModal = ({
  isOpen,
  canMoveToFront,
  canAddToFront,
  onClose,
  onPlay,
  onMoveNewTrackToFront,
  onAddNewTrackToFront
}: Props) => {
  const { breakPoint } = useBreakPoints()
  const [settings] = useLocalStorage<SettingValues>({
    key: LOCAL_STORAGE_KEYS.SETTINGS,
    defaultValue: DEFAULT_SETTING_VALUES
  })
  const {
    keyword,
    handleKeywordChange,
    spotifySearchResult,
    showMoreSpotifySearchResult,
    isSearchingSpotify,
    mergedWebDAVSearchResult,
    resetAll
  } = useSearch()
  const spotifySettingState = useRecoilValue(spotifySettingStateAtom)
  const webDAVSettingState = useRecoilValue(webDAVSettingStateAtom)

  useEffect(() => {
    if (!isOpen) resetAll()
  }, [isOpen, resetAll])

  const handleArtworkPlayButtonClick = useCallback(
    async (track: Track) => {
      if (settings.CLOSE_MODAL_AUTOMATICALLY_WHEN_TRACK_SELECTED) onClose()
      await onPlay(track)
      resetAll()
    },
    [
      onClose,
      onPlay,
      resetAll,
      settings.CLOSE_MODAL_AUTOMATICALLY_WHEN_TRACK_SELECTED
    ]
  )

  return (
    <ModalDefault title="🔍 楽曲を検索" isOpen={isOpen} onClose={onClose}>
      <Input
        data-autofocus
        placeholder="楽曲タイトルを入力…"
        value={keyword}
        onChange={e => handleKeywordChange(e)}
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
