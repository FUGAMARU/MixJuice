import { Box, Flex } from "@mantine/core"
import { useElementSize, useHover } from "@mantine/hooks"
import {
  Dispatch,
  SetStateAction,
  memo,
  useEffect,
  useMemo,
  useState
} from "react"
import PlayerState from "./PlayerState"
import AlbumArtwork from "@/components/templates/MainPage/AlbumArtwork"
import TrackInfo from "@/components/templates/MainPage/TrackInfo"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import styles from "@/styles/Player.module.css"
import { Track } from "@/types/Track"
import { millisecondsToTimeString } from "@/utils/millisecondsToTimeString"

let animationTimeoutId: NodeJS.Timeout

type Props = {
  currentTrackInfo: Track | undefined
  playbackPercentage: number
  isPlaying: boolean
  onNextTrack: () => Promise<void>
  onPreviousTrack: () => Promise<void>
  onTogglePlay: () => Promise<void>
  onSeekTo: (position: number) => Promise<void>
  hasNextTrack: boolean
  hasPreviousTrack: boolean
  spotifyPlaybackQuality: string | undefined
  isPreparingPlayback: boolean
  setPlayerHeight: Dispatch<SetStateAction<number>>
  volume: number
  setVolume: Dispatch<SetStateAction<number>>
}

let timerId: NodeJS.Timeout

const Player = ({
  currentTrackInfo,
  playbackPercentage,
  isPlaying,
  onNextTrack,
  onPreviousTrack,
  onTogglePlay,
  onSeekTo,
  hasNextTrack,
  hasPreviousTrack,
  spotifyPlaybackQuality,
  isPreparingPlayback,
  setPlayerHeight,
  volume,
  setVolume
}: Props) => {
  const { breakPoint } = useBreakPoints()
  const {
    ref: containerRef,
    height: containerHeight,
    width: containerWidth
  } = useElementSize()

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

    if (!currentTrackInfo && !hasNextTrack) {
      setFadeAnimationClassNames(`${prefix} animate__fadeOut`)
      animationTimeoutId = setTimeout(() => {
        setIsSeekbarShown(false)
      }, 2000)
    }

    return () => clearTimeout(animationTimeoutId)
  }, [isPlaying, setFadeAnimationClassNames, hasNextTrack, currentTrackInfo])

  const { hovered: isSeekbarHovered, ref: seekbarRef } = useHover()

  /** シークバーの上をマウスが一瞬通り過ぎただけでアニメーションが開始してしまうので、シークバーの上にカーソルが100ミリ秒以上いた場合にホバーされた扱いにする
   * CSSのanimation-delayを使用すると、シークバーの上をマウスが一瞬通り過ぎた時にホバーが外れた用のイベントが発生する関係で一瞬表示がおかしくなるので、JSで管理する
   */
  const [isSeekbarHoveredControlled, setIsSeekbarHoveredControlled] =
    useState(false)

  useEffect(() => {
    if (timerId) clearTimeout(timerId)

    const newTimerId = setTimeout(() => {
      setIsSeekbarHoveredControlled(isSeekbarHovered)
    }, 100)

    timerId = newTimerId

    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [isSeekbarHovered])

  /** コンポーネントが描写されてから一度でもシークバーがホバーされたか */
  const [hasSeekbarHobered, setHasSeekbarHovered] = useState(false)
  useEffect(() => {
    if (isSeekbarHoveredControlled) setHasSeekbarHovered(true)
  }, [isSeekbarHoveredControlled])

  const [seekbarOverlayClassName, setSeekbarOverlayClassName] = useState("")
  useEffect(() => {
    if (isSeekbarHoveredControlled) {
      setSeekbarOverlayClassName(`${styles.overlayHovered}`)
      return
    }

    if (hasSeekbarHobered) {
      setSeekbarOverlayClassName(styles.overlayBlured)
    }
  }, [isSeekbarHoveredControlled, hasSeekbarHobered])

  const remainingTime = useMemo(() => {
    if (!currentTrackInfo) return "0:00"

    const currentTime = currentTrackInfo.duration * (playbackPercentage / 100)
    const remainingTime = currentTrackInfo.duration - currentTime

    return remainingTime < 0 ? "0:00" : millisecondsToTimeString(remainingTime)
  }, [currentTrackInfo, playbackPercentage])

  return (
    <>
      <Flex h="100%" pos="relative" ref={containerRef}>
        <AlbumArtwork
          size={containerHeight}
          image={currentTrackInfo?.image}
          smaller={isSmallerThanTablet}
          isPlaying={isPlaying}
          isPreparingPlayback={isPreparingPlayback}
          hasCurrentTrack={currentTrackInfo !== undefined}
          hasNextTrack={hasNextTrack}
          hasPreviousTrack={hasPreviousTrack}
          onTogglePlay={onTogglePlay}
          onNextTrack={onNextTrack}
          onPreviousTrack={onPreviousTrack}
        />

        <TrackInfo
          title={currentTrackInfo?.title || "再生待機中…"}
          artist={currentTrackInfo?.artist || "再生待機中…"}
          backgroundImage={currentTrackInfo?.image?.src || ""}
          smaller={isSmallerThanTablet}
          calculatedWidth={containerWidth - containerHeight}
        />

        {breakPoint === "PC" && (
          <Box pos="absolute" right="-0.8rem" bottom={0}>
            <PlayerState
              isPlaying={isPlaying}
              isPreparingPlayback={isPreparingPlayback}
              spotifyPlaybackQuality={spotifyPlaybackQuality}
              remainingTime={remainingTime}
              currentTrackProvider={currentTrackInfo?.provider}
              volume={volume}
              setVolume={setVolume}
              onTogglePlay={onTogglePlay}
            />
          </Box>
        )}
      </Flex>

      <Flex
        className={fadeAnimationClassNames}
        h={isSeekbarHoveredControlled ? "0.7rem" : "0.3rem"}
        ref={seekbarRef}
        pos="relative"
        sx={{
          cursor: "pointer",
          transition: "all 0.2s ease-out",
          visibility: isSeekbarShown ? "visible" : "hidden",
          zIndex: ZINDEX_NUMBERS.SEEKBAR_CONTAINER
        }}
        onClick={async e => {
          if (seekbarRef.current && currentTrackInfo) {
            const rect = seekbarRef.current.getBoundingClientRect()
            const width0PercentX = rect.left
            const width100PercentX = rect.right
            const clickX = e.clientX

            const clickPercentage =
              (clickX - width0PercentX) / (width100PercentX - width0PercentX)
            await onSeekTo(currentTrackInfo.duration * clickPercentage)
          }
        }}
      >
        <div
          className={`${styles.overlay} ${seekbarOverlayClassName}`}
          style={{
            left: `${playbackPercentage}%`
          }}
        />
        {/** MantineのBoxコンポーネントを使用してシークバーを実装すると、再生位置が更新される度にheadタグ内にMantineが生成したstyleタグが追加されてしまうのでdivにて実装 */}
        <div
          className={styles.seekbarContainer}
          style={{
            width: `${playbackPercentage}%`
          }}
        >
          <div className={styles.seekbarLine} />
          <div className={styles.seekbarDot} />
        </div>
      </Flex>
    </>
  )
}

export default memo(Player)
