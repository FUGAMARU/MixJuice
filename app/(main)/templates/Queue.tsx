import { Box, Divider, Flex, Text } from "@mantine/core"
import { useViewportSize } from "@mantine/hooks"
import { useMemo } from "react"
import { useRecoilValue } from "recoil"
import { playerHeightAtom } from "@/atoms/playerHeightAtom"
import { queueAtom } from "@/atoms/queueAtom"
import GradientCircle from "@/components/parts/GradientCircle"
import ListItem from "@/components/parts/ListItem"
import { HEADER_HEIGHT } from "@/constants/Styling"
import useBreakPoints from "@/hooks/useBreakPoints"
import usePlayer from "@/hooks/usePlayer"
import { isSquareApproximate } from "@/utils/isSquareApproximate"

const Queue = () => {
  const { setRespVal } = useBreakPoints()
  const { height: viewportHeight } = useViewportSize()
  const playerHeight = useRecoilValue(playerHeightAtom)
  const scrollAreaHeight = useMemo(
    () => viewportHeight - HEADER_HEIGHT - playerHeight,
    [viewportHeight, playerHeight]
  )
  const queue = useRecoilValue(queueAtom)
  const { onSkipTo } = usePlayer({ initializeUseSpotifyPlayer: false })

  return (
    <Box
      h={scrollAreaHeight}
      px={setRespVal("0.5rem", "0.5rem", "1.5rem")}
      py="md"
      sx={{ overflowY: "auto" }}
    >
      {queue.length === 0 && (
        <Text ta="center" fz={setRespVal("xs", "sm", "sm")}>
          プレイリストを選択して『MIX!』ボタンを押してみましょう！
        </Text>
      )}

      {queue.map((data, idx) => {
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

export default Queue
