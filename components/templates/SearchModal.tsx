import { Box, Flex, Input, Stack, Text } from "@mantine/core"
import { memo, useEffect, useMemo, useState } from "react"
import { useSetRecoilState } from "recoil"
import ListItem from "../parts/ListItem"
import ModalDefault from "../parts/ModalDefault"
import ProviderHeading from "../parts/ProviderHeading"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSpotifyApi from "@/hooks/useSpotifyApi"
import { SpotifyApiTrack } from "@/types/SpotifyApiTrack"

type Props = {
  isOpen: boolean
  onClose: () => void
}

let timer: NodeJS.Timer

const SearchModal = ({ isOpen, onClose }: Props) => {
  const { setRespVal } = useBreakPoints()
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const { searchTracks } = useSpotifyApi({ initialize: false })
  const isSpotifyAuthorized = useMemo(
    () =>
      localStorage.getItem(LOCAL_STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN) !== null,
    []
  )

  const [spotifySearchResult, setSpotifySearchResult] = useState<
    SpotifyApiTrack["track"][]
  >([])

  const [keyword, setKeyword] = useState("")
  useEffect(() => {
    ;(async () => {
      if (!keyword) return

      if (timer) clearTimeout(timer)

      timer = setTimeout(async () => {
        if (isSpotifyAuthorized) {
          try {
            const res = await searchTracks(keyword)
            setSpotifySearchResult(res)
          } catch (e) {
            setErrorModalInstance(prev => [...prev, e])
          }
        }
      }, 500)

      return () => clearTimeout(timer)
    })()
  }, [keyword, searchTracks, isSpotifyAuthorized, setErrorModalInstance])

  return (
    <ModalDefault title="🔍 楽曲を検索" isOpen={isOpen} onClose={onClose}>
      <Input
        placeholder="楽曲タイトルを入力…"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />

      <Stack mt="sm" spacing="xs">
        {isSpotifyAuthorized && (
          <Box>
            <Box mb="xs">
              <ProviderHeading
                providerIconSrc="/spotify-logo.png"
                provider="spotify"
              />
            </Box>

            {spotifySearchResult.length > 0 ? (
              spotifySearchResult.map(track => (
                <Box
                  key={track.id}
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
                      imgSrc={track.album.images[0].url}
                      title={track.name}
                      subText={`/ ${track.artists
                        .map(artist => artist.name)
                        .join(", ")}`}
                    />
                  </Box>
                </Box>
              ))
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
              (キャッシュ済み)
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
              <ListItem imgSrc={undefined} title={"テスト"} subText={"説明"} />
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