import { Box, Flex } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { memo, useEffect, useMemo } from "react"
import { useSetRecoilState } from "recoil"
import { playerHeightAtom } from "@/atoms/playerHeightAtom"
import AlbumArtwork from "@/components/parts/AlbumArtwork"
import TrackInfo from "@/components/parts/TrackInfo"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import usePlayer from "@/hooks/usePlayer"
import styles from "@/styles/Player.module.css"
import { isSquareApproximate } from "@/utils/isSquareApproximate"

const Player = () => {
  const { breakPoint } = useBreakPoints()
  const {
    ref: containerRef,
    height: containerHeight,
    width: containerWidth
  } = useElementSize()

  const setPlayerHeight = useSetRecoilState(playerHeightAtom)
  useEffect(() => {
    setPlayerHeight(containerHeight)
  }, [containerHeight, setPlayerHeight])

  /** 横幅がタブレットサイズ以上か */
  const isSmallerThanTablet = useMemo(
    () => !(breakPoint === "PC" || breakPoint === "Tablet"),
    [breakPoint]
  )

  const {
    currentTrackInfo,
    playbackPosition,
    isPlaying,
    onNextTrack,
    onTogglePlay
  } = usePlayer({
    initializeUseSpotifyPlayer: true
  })

  return (
    <>
      <Flex w="100%" h="100%" ref={containerRef}>
        <AlbumArtwork
          size={containerHeight}
          src={currentTrackInfo?.imgSrc || undefined}
          objectFit={
            !currentTrackInfo
              ? "contain"
              : isSquareApproximate(
                  currentTrackInfo.imgWidth,
                  currentTrackInfo.imgHeight
                )
              ? "cover"
              : "contain"
          }
          smaller={isSmallerThanTablet}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onNextTrack={onNextTrack}
        />

        <TrackInfo
          title={currentTrackInfo?.title || "再生待機中…"}
          artist={currentTrackInfo?.artist || "再生待機中…"}
          backgroundImage={currentTrackInfo?.imgSrc || ""}
          smaller={isSmallerThanTablet}
          calculatedWidth={containerWidth - containerHeight}
        />
      </Flex>

      {/** wを再生時間の割合と同期させる */}
      <Flex>
        <Box w="0.3rem" h="0.3rem" bg="#0bec7c" />
        <Box
          className={styles.loader}
          w={`${playbackPosition}%`}
          h="0.3rem"
          bg="spotify"
          sx={{
            ":before": {
              zIndex: ZINDEX_NUMBERS.SEEKBAR_LINE
            },
            ":after": {
              zIndex: ZINDEX_NUMBERS.SEEKBAR_CIRCLE
            }
          }}
        />
      </Flex>
    </>
  )
}

export default memo(Player)
