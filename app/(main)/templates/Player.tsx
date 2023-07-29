import { Box, Flex, Tooltip } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { memo, useEffect, useMemo, useState } from "react"
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs"
import { HiVolumeUp } from "react-icons/hi"
import { useSetRecoilState } from "recoil"
import { playerHeightAtom } from "@/atoms/playerHeightAtom"
import AlbumArtwork from "@/components/parts/AlbumArtwork"
import PlaybackStateBadge from "@/components/parts/PlaybackStateBadge"
import TrackInfo from "@/components/parts/TrackInfo"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import styles from "@/styles/Player.module.css"
import { Track } from "@/types/Track"
import { isSquareApproximate } from "@/utils/isSquareApproximate"

let animationTimeoutId: NodeJS.Timer

type Props = {
  currentTrackInfo: Track | undefined
  playbackPercentage: number
  isPlaying: boolean
  onNextTrack: () => Promise<void>
  onTogglePlay: () => Promise<void>
  hasSomeTrack: boolean
  spotifyPlaybackQuality: string | undefined
  isPreparingPlayback: boolean
}

const Player = ({
  currentTrackInfo,
  playbackPercentage,
  isPlaying,
  onNextTrack,
  onTogglePlay,
  hasSomeTrack,
  spotifyPlaybackQuality,
  isPreparingPlayback
}: Props) => {
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

  /** シークバーアニメーション管理 */
  const [isSeekbarShown, setIsSeekbarShown] = useState(false)
  const [fadeAnimationClassNames, setFadeAnimationClassNames] = useState("")
  useEffect(() => {
    const prefix = "animate__animated animate__slow"

    if (isPlaying) {
      setFadeAnimationClassNames(`${prefix} animate__fadeIn`)
      setIsSeekbarShown(true)
      return () => clearTimeout(animationTimeoutId)
    }

    if (!hasSomeTrack) {
      setFadeAnimationClassNames(`${prefix} animate__fadeOut`)
      animationTimeoutId = setTimeout(() => {
        setIsSeekbarShown(false)
      }, 2000)
    }

    return () => clearTimeout(animationTimeoutId)
  }, [isPlaying, setFadeAnimationClassNames, hasSomeTrack])

  return (
    <>
      <Flex w="100%" h="100%" pos="relative" ref={containerRef}>
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

        {breakPoint === "PC" && (
          <Flex pos="absolute" right="1.5rem" bottom="1rem" gap="xs">
            {(isPreparingPlayback ||
              currentTrackInfo?.provider === "spotify") && (
              <Tooltip label="ストリーミング品質">
                <Box>
                  <PlaybackStateBadge
                    cursor="default"
                    loading={
                      isPreparingPlayback ||
                      spotifyPlaybackQuality === undefined
                    }
                  >
                    {spotifyPlaybackQuality}
                  </PlaybackStateBadge>
                </Box>
              </Tooltip>
            )}
            <PlaybackStateBadge cursor="pointer">
              <Flex align="center" gap="0.4rem">
                <Box lh={0}>
                  <HiVolumeUp size="1.2rem" />
                </Box>
                0%
              </Flex>
            </PlaybackStateBadge>

            <PlaybackStateBadge cursor="pointer" onClick={onTogglePlay}>
              <Flex align="center" gap="0.2rem">
                <Box lh={0}>
                  {isPlaying ? (
                    <BsFillPlayFill size="1.2rem" />
                  ) : (
                    <BsFillPauseFill size="1.2rem" />
                  )}
                </Box>
                {Math.round(playbackPercentage)}%
              </Flex>
            </PlaybackStateBadge>
          </Flex>
        )}
      </Flex>

      <Flex
        className={fadeAnimationClassNames}
        pos="relative"
        sx={{
          visibility: isSeekbarShown ? "visible" : "hidden",
          zIndex: ZINDEX_NUMBERS.SEEKBAR_CONTAINER
        }}
      >
        <Box w="0.3rem" h="0.3rem" bg="#0bec7c" />
        {/** MantineのBoxコンポーネントを使用してシークバーを実装すると、再生位置が更新される度にheadタグ内にMantineが生成したstyleタグが追加されてしまうのでdivにて実装 */}
        <div
          className={styles.loader}
          style={{ width: `${playbackPercentage}%` }}
        />
      </Flex>
    </>
  )
}

export default memo(Player)
