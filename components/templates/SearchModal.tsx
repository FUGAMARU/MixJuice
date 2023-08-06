import { Box, Center, Flex, Input, Loader, Stack, Text } from "@mantine/core"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { useSetRecoilState } from "recoil"
import ArrowTextButton from "../parts/ArrowTextButton"
import ListItem from "../parts/ListItem"
import ListItemContainer from "../parts/ListItemContainer"
import ModalDefault from "../parts/ModalDefault"
import ProviderHeading from "../parts/ProviderHeading"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSpotifyApi from "@/hooks/useSpotifyApi"
import useWebDAVTrackDatabase from "@/hooks/useWebDAVTrackDatabase"
import { CheckboxListModalItem } from "@/types/CheckboxListModalItem"
import { SpotifyApiTrack } from "@/types/SpotifyApiTrack"

type Props = {
  isOpen: boolean
  onClose: () => void
}

let timer: NodeJS.Timer

const SearchModal = ({ isOpen, onClose }: Props) => {
  const { setRespVal, breakPoint } = useBreakPoints()
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const { searchTracks: searchSpotifyTracks } = useSpotifyApi({
    initialize: false
  })
  const { searchTracksByKeyword: searchWebDAVTracks } = useWebDAVTrackDatabase()
  const [isSearching, setIsSearching] = useState(false)

  const [isSpotifyAuthorized, setIsSpotifyAuthorized] = useState(false)
  useEffect(() => {
    setIsSpotifyAuthorized(
      localStorage.getItem(LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN) !== null
    )
  }, [])
  const [spotifySearchNextOffset, setSpotifySearchNextOffset] = useState(0)
  const [spotifySearchResult, setSpotifySearchResult] = useState<
    SpotifyApiTrack["track"][]
  >([])

  const [isWebDAVAuthorized, setIsWebDAVAuthorized] = useState(false)
  useEffect(() => {
    setIsWebDAVAuthorized(
      localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_IS_AUTHENTICATED) ===
        "true"
    )
  }, [])
  const [webDAVSearchResult, setWebDAVSearchResult] = useState<
    CheckboxListModalItem[]
  >([])

  const inputRef = useRef<HTMLInputElement>(null)
  const [keyword, setKeyword] = useState("")
  const handleKeywordChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      setKeyword(input)
      setSpotifySearchNextOffset(0)

      if (!input) {
        setSpotifySearchResult([])
        return
      }

      if (timer) clearTimeout(timer)

      /** 検索窓に文字が入力されてから500ミリ秒後にAPIを叩く (入力された瞬間にAPIを叩くとリクエスト過多になる) */
      timer = setTimeout(async () => {
        setIsSearching(true)

        const spotifySearchPromise = isSpotifyAuthorized
          ? searchSpotifyTracks(input, spotifySearchNextOffset)
          : Promise.resolve({ data: [], nextOffset: 0 })

        const webDAVSearchPromise = isWebDAVAuthorized
          ? searchWebDAVTracks(input)
          : Promise.resolve([])

        try {
          const [spotifyRes, webDAVRes] = await Promise.all([
            spotifySearchPromise,
            webDAVSearchPromise
          ])

          setSpotifySearchResult(spotifyRes.data)
          setSpotifySearchNextOffset(spotifyRes.nextOffset)

          setWebDAVSearchResult(
            webDAVRes.map(track => {
              return {
                id: track.id,
                name: track.title,
                description: track.artist,
                imgSrc: track.imgSrc
              }
            })
          )
        } catch (e) {
          setErrorModalInstance(prev => [...prev, e])
        } finally {
          setIsSearching(false)
        }
        //TODO: WebDAVの検索処理がここに入る
      }, 500)
    },
    [
      isSpotifyAuthorized,
      searchSpotifyTracks,
      setErrorModalInstance,
      spotifySearchNextOffset,
      isWebDAVAuthorized,
      searchWebDAVTracks
    ]
  )

  const showMoreSpotifySearchResult = useCallback(async () => {
    try {
      const res = await searchSpotifyTracks(keyword, spotifySearchNextOffset)
      setSpotifySearchResult(prev => [...prev, ...res.data])
      setSpotifySearchNextOffset(res.nextOffset)
    } catch (e) {
      setErrorModalInstance(prev => [...prev, e])
    }
  }, [
    keyword,
    searchSpotifyTracks,
    setErrorModalInstance,
    spotifySearchNextOffset
  ])

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
                        imgSrc={track.album.images[0].url}
                        title={track.name}
                        subText={`/ ${track.artists
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
                        imgSrc={track.imgSrc}
                        title={track.name}
                        subText={track.description}
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
                imgSrc={undefined}
                title={
                  "テストテストテストテストテストテストテストテストテストテストテストテストテストテスト"
                }
                subText={
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
              <ListItem
                imgSrc={undefined}
                title={"テスト2"}
                subText={"説明2"}
              />
            </Box>
          </Box>
        </Box>
      </Stack>
    </ModalDefault>
  )
}

export default memo(SearchModal)
