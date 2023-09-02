import { Box, Overlay, Group, Center } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import Image from "next/image"
import { useState, useEffect, memo, useCallback, useMemo } from "react"
import {
  IoPauseCircleSharp,
  IoPlayBack,
  IoPlayCircleSharp,
  IoPlayForward
} from "react-icons/io5"
import { MdOutlineLibraryMusic } from "react-icons/md"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import { ImageInfo } from "@/types/ImageInfo"
import { isSquareApproximate } from "@/utils/isSquareApproximate"

type Props = {
  size: number
  image: ImageInfo | undefined
  smaller: boolean // スマホなどの幅が狭い画面向けにUIを小さめに表示するか
  isPlaying: boolean
  isPreparingPlayback: boolean
  onTogglePlay: () => Promise<void>
  onNextTrack: () => Promise<void>
}

const AlbumArtwork = ({
  size,
  image,
  smaller,
  isPlaying,
  isPreparingPlayback,
  onTogglePlay,
  onNextTrack
}: Props) => {
  const { setRespVal } = useBreakPoints()
  /** プレイヤーコントロールホバー時アニメーション管理 */
  const { hovered: isArtworkHovered, ref: artworkRef } = useHover()
  const [isPlayerControlShown, setPlayerControlShown] = useState(false)
  const [overlayClassNames, setOverlayClassNames] = useState("")
  useEffect(() => {
    const prefix = "animate__animated animate__faster"

    if (isArtworkHovered) {
      setOverlayClassNames(`${prefix} animate__fadeIn`)
      setPlayerControlShown(true)
    } else {
      setOverlayClassNames(`${prefix} animate__fadeOut`)
      setTimeout(() => {
        setPlayerControlShown(false)
      }, 400)
    }
  }, [isArtworkHovered])

  const handlePlayForwardButtonClick = useCallback(async () => {
    await onNextTrack()
  }, [onNextTrack])

  /** 画像サイズが正方形に近ければ余白を消した状態(objectFit: cover)で表示する */
  const objectFit = useMemo(() => {
    if (!image) return "cover"
    return isSquareApproximate(image.width, image.height) ? "cover" : "contain"
  }, [image])

  return (
    <Box
      h="100%"
      w={size}
      ref={artworkRef}
      bg="white"
      pos="relative"
      sx={{
        flexShrink: 0,
        zIndex: ZINDEX_NUMBERS.ALBUM_ARTWORK
      }}
    >
      {!image ? (
        <Center h="100%" w="100%" bg="#eaeaea">
          <MdOutlineLibraryMusic
            size={setRespVal("2rem", "2.5rem", "2.5rem")}
            color="#909090"
          />
        </Center>
      ) : (
        <>
          <Image
            // 高さ・幅はとりあえず指定しないといけないので適当に指定
            height={1000}
            width={1000}
            src={image.src}
            alt="album artwork"
            style={{
              objectFit,
              height: "100%",
              width: "100%"
            }}
          />
          {isPlayerControlShown && (
            <Overlay
              className={overlayClassNames}
              center
              gradient="linear-gradient(145deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.3) 100%)"
              opacity={0.85}
            >
              <Group position="center" spacing={smaller ? "xs" : "lg"}>
                <IoPlayBack
                  color="white"
                  size={smaller ? "1.5rem" : "2rem"}
                  style={{
                    cursor: "pointer",
                    transition: "all .2s ease-in-out"
                  }}
                  opacity={isPreparingPlayback ? 0.5 : 1}
                  pointerEvents={isPreparingPlayback ? "none" : "auto"}
                />
                {isPlaying ? (
                  <IoPauseCircleSharp
                    color="white"
                    size={smaller ? "2rem" : "3rem"}
                    style={{ cursor: "pointer" }}
                    onClick={onTogglePlay}
                  />
                ) : (
                  <IoPlayCircleSharp
                    color="white"
                    size={smaller ? "2rem" : "3rem"}
                    style={{ cursor: "pointer" }}
                    onClick={onTogglePlay}
                  />
                )}
                <IoPlayForward
                  color="white"
                  size={smaller ? "1.5rem" : "2rem"}
                  style={{
                    cursor: "pointer",
                    transition: "all .2s ease-in-out"
                  }}
                  opacity={isPreparingPlayback ? 0.5 : 1}
                  pointerEvents={isPreparingPlayback ? "none" : "auto"}
                  onClick={handlePlayForwardButtonClick}
                />
              </Group>
            </Overlay>
          )}
        </>
      )}
    </Box>
  )
}

export default memo(AlbumArtwork)
