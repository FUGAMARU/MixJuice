import { Box, Divider, Flex, Text } from "@mantine/core"
import { useViewportSize } from "@mantine/hooks"
import { useMemo } from "react"
import { useRecoilValue } from "recoil"
import ListItem from "../../components/parts/ListItem"
import GradientCircle from "@/app/components/parts/GradientCircle"
import { musicListAtom } from "@/atoms/musicListAtom"
import { playerHeightAtom } from "@/atoms/playerHeightAtom"
import { HEADER_HEIGHT } from "@/constants/Styling"
import useBreakPoints from "@/hooks/useBreakPoints"
import usePlayer from "@/hooks/usePlayer"
import { isSquareApproximate } from "@/utils/isSquareApproximate"

const MusicList = () => {
  const { setRespVal } = useBreakPoints()
  const { height: viewportHeight } = useViewportSize()
  const playerHeight = useRecoilValue(playerHeightAtom)
  const scrollAreaHeight = useMemo(
    () => viewportHeight - HEADER_HEIGHT - playerHeight,
    [viewportHeight, playerHeight]
  )
  const musicList = useRecoilValue(musicListAtom)

  const { onSkipTo } = usePlayer({ initializeUseSpotifyPlayer: false })

  return (
    <Box
      h={scrollAreaHeight}
      px={setRespVal("0.5rem", "0.5rem", "1.5rem")}
      py="md"
      sx={{ overflowY: "auto" }}
    >
      {musicList.length === 0 && (
        <Text ta="center" fz={setRespVal("xs", "sm", "sm")}>
          プレイリストを選択して『MIX!』ボタンを押してみましょう！
        </Text>
      )}

      {musicList.map((data, idx) => {
        return (
          <Box key={idx}>
            {idx !== 0 && <Divider my="xs" />}

            <Flex px={"0.5rem"} align="center" gap="sm">
              <GradientCircle
                color={data.provider}
                tooltipLabel={
                  data.provider === "spotify" ? "Spotifyの楽曲" : "WebDAVの楽曲"
                }
              />

              <ListItem
                imgSrc={data.imgSrc}
                objectFit={
                  isSquareApproximate(data.imgWidth, data.imgHeight)
                    ? "cover"
                    : "contain"
                }
                title={data.title}
                subText={` / ${data.artist}`}
                playable
                onArtworkPlayButtonClick={() => onSkipTo(data.id)}
              />
            </Flex>
          </Box>
        )
      })}
    </Box>
  )
}

export default MusicList
