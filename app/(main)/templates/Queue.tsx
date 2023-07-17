import { Box, Flex, Text } from "@mantine/core"
import { useViewportSize } from "@mantine/hooks"
import { memo, useMemo } from "react"
import { FixedSizeList } from "react-window"
import { useRecoilValue } from "recoil"
import { playerHeightAtom } from "@/atoms/playerHeightAtom"
import { queueAtom } from "@/atoms/queueAtom"
import GradientCircle from "@/components/parts/GradientCircle"
import ListItem from "@/components/parts/ListItem"
import { HEADER_HEIGHT, QUEUE_PADDING_TOP } from "@/constants/Styling"
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
      pt={`${QUEUE_PADDING_TOP}px`}
    >
      {queue.length === 0 && (
        <Text ta="center" fz={setRespVal("xs", "sm", "sm")}>
          プレイリストを選択して『MIX!』ボタンを押してみましょう！
        </Text>
      )}

      <FixedSizeList
        width="100%"
        height={scrollAreaHeight - QUEUE_PADDING_TOP}
        itemCount={queue.length}
        itemSize={80} // キューのアイテム1つ分の高さ
      >
        {({ index, style }) => {
          const data = queue[index]
          return (
            <div
              style={{
                ...style,
                paddingLeft: "0.5rem",
                paddingRight: "0.5rem",
                borderTop: index !== 0 ? "solid 1px #ced4da" : "none"
              }}
            >
              <Flex h="100%" align="center" gap="sm">
                <GradientCircle
                  color={data.provider}
                  tooltipLabel={
                    data.provider === "spotify"
                      ? "Spotifyの楽曲"
                      : "WebDAVの楽曲"
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
            </div>
          )
        }}
      </FixedSizeList>
    </Box>
  )
}

export default memo(Queue)
