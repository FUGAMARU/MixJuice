import { Box, Center, Flex, Input, Loader, Stack, Text } from "@mantine/core"
import { memo, useEffect, useRef } from "react"
import ArrowTextButton from "../parts/ArrowTextButton"
import ListItem from "../parts/ListItem"
import ListItemContainer from "../parts/ListItemContainer"
import ModalDefault from "../parts/ModalDefault"
import ProviderHeading from "../parts/ProviderHeading"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSearch from "@/hooks/useSearch"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const SearchModal = ({ isOpen, onClose }: Props) => {
  const { setRespVal, breakPoint } = useBreakPoints()
  const {
    keyword,
    handleKeywordChange,
    isSpotifyAuthorized,
    isWebDAVAuthorized,
    spotifySearchResult,
    webDAVSearchResult,
    showMoreSpotifySearchResult,
    isSearching
  } = useSearch()

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

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
                    <Box sx={{ flex: "1", overflow: "hidden" }}>
                      <ListItem
                        image={{
                          src: track.album.images[0].url,
                          height: track.album.images[0].height,
                          width: track.album.images[0].width
                        }}
                        title={track.name}
                        caption={`/ ${track.artists
                          .map(artist => artist.name)
                          .join(", ")}`}
                      />
                    </Box>
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

            {webDAVSearchResult.length > 0 && keyword.length > 0 ? (
              <>
                {webDAVSearchResult.map(track => (
                  <ListItemContainer key={track.id}>
                    <Box sx={{ flex: "1", overflow: "hidden" }}>
                      <ListItem
                        image={track.image}
                        title={track.title}
                        caption={track.caption}
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
        )}

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

          <Flex
            px={setRespVal("xs", "md", "md")}
            py="xs"
            align="center"
            gap="md"
            sx={{
              cursor: "pointer",
              borderRadius: "10px",
              transition: "background-color 0.3s ease-out",
              ":hover": { backgroundColor: "#f5f5f5" }
            }}
          >
            <Box sx={{ flex: "1", overflow: "hidden" }}>
              <ListItem
                image={undefined}
                title={
                  "テストテストテストテストテストテストテストテストテストテストテストテストテストテスト"
                }
                caption={
                  "説明説明説明説明説明説明説明説明説明説明説明説明説明説明説明説明説明説明"
                }
              />
            </Box>
          </Flex>

          <Box
            px={setRespVal("xs", "md", "md")}
            py="xs"
            sx={{
              cursor: "pointer",
              borderRadius: "10px",
              transition: "background-color 0.3s ease-out",
              ":hover": { backgroundColor: "#f5f5f5" }
            }}
          >
            <Box sx={{ flex: "1", overflow: "hidden" }}>
              <ListItem image={undefined} title={"テスト2"} caption={"説明2"} />
            </Box>
          </Box>
        </Box>
      </Stack>
    </ModalDefault>
  )
}

export default memo(SearchModal)
