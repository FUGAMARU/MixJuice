import { Overlay, Group, Center } from "@mantine/core"
import { memo, useEffect, useState } from "react"
import {
  IoPlayBack,
  IoPauseCircleSharp,
  IoPlayCircleSharp,
  IoPlayForward
} from "react-icons/io5"

type Props = {
  isHovered: boolean
  borderRadius?: string
} & (
  | {
      simplified: true
      smaller?: never
      isPlaying?: never
      isPreparingPlayback?: never
      hasCurrentTrack?: never
      hasNextTrack?: never
      onTogglePlay?: never
      onNextTrack?: never
      onArtworkPlayButtonClick: () => void
    }
  | {
      simplified?: false
      smaller: boolean
      isPlaying: boolean
      isPreparingPlayback: boolean
      hasCurrentTrack: boolean
      hasNextTrack: boolean
      onTogglePlay: () => Promise<void>
      onNextTrack: () => Promise<void>
      onArtworkPlayButtonClick?: never
    }
)

const ArtworkOverlay = ({
  isHovered,
  borderRadius,
  simplified,
  smaller,
  isPlaying,
  isPreparingPlayback,
  hasCurrentTrack,
  hasNextTrack,
  onTogglePlay,
  onNextTrack,
  onArtworkPlayButtonClick
}: Props) => {
  /** プレイヤーコントロールホバー時アニメーション管理 */
  const [overlayClassNames, setOverlayClassNames] = useState("")
  useEffect(() => {
    const prefix = "animate__animated animate__faster"

    if (isHovered) {
      setOverlayClassNames(`${prefix} animate__fadeIn`)
    }

    if (!isHovered && overlayClassNames) {
      setOverlayClassNames(`${prefix} animate__fadeOut`)
    }
  }, [isHovered, overlayClassNames])

  return (
    <Overlay
      className={overlayClassNames}
      center
      gradient={`linear-gradient(145deg, rgba(0, 0, 0, ${
        simplified ? "0.8" : "0.9"
      }) 0%, rgba(0, 0, 0, 0.3) 100%)`}
      sx={{
        borderRadius,
        visibility: overlayClassNames ? "visible" : "hidden"
      }}
    >
      {simplified ? (
        <Center
          sx={{ cursor: "pointer", borderRadius }}
          onClick={onArtworkPlayButtonClick}
        >
          <IoPlayCircleSharp color="white" size="2rem" />
        </Center>
      ) : (
        <Group position="center" spacing={smaller ? "xs" : "lg"}>
          <IoPlayBack
            color="white"
            size={smaller ? "1.5rem" : "2rem"}
            style={{
              transition: "all .2s ease-in-out"
            }}
            cursor="pointer"
            opacity={isPreparingPlayback || !hasCurrentTrack ? 0.5 : 1}
            pointerEvents={isPreparingPlayback ? "none" : "auto"}
          />
          {isPlaying ? (
            <IoPauseCircleSharp
              color="white"
              size={smaller ? "2rem" : "3rem"}
              cursor="pointer"
              onClick={onTogglePlay}
            />
          ) : (
            <IoPlayCircleSharp
              color="white"
              size={smaller ? "2rem" : "3rem"}
              opacity={hasCurrentTrack ? 1 : 0.5}
              pointerEvents={hasCurrentTrack ? "auto" : "none"}
              cursor="pointer"
              onClick={onTogglePlay}
            />
          )}
          <IoPlayForward
            color="white"
            size={smaller ? "1.5rem" : "2rem"}
            style={{
              transition: "all .2s ease-in-out"
            }}
            cursor="pointer"
            opacity={
              isPreparingPlayback || !hasCurrentTrack || !hasNextTrack ? 0.5 : 1
            }
            pointerEvents={
              isPreparingPlayback || !hasCurrentTrack || !hasNextTrack
                ? "none"
                : "auto"
            }
            onClick={async () => await onNextTrack()}
          />
        </Group>
      )}
    </Overlay>
  )
}

export default memo(ArtworkOverlay)
