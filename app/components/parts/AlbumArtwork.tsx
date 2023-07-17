import { Box, Overlay, Group, Center } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  IoPauseCircleSharp,
  IoPlayBack,
  IoPlayCircleSharp,
  IoPlayForward
} from "react-icons/io5"
import { MdOutlineLibraryMusic } from "react-icons/md"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"

type Props = {
  size: number
  src: string | undefined
  objectFit?: "contain" | "cover"
  smaller: boolean // スマホなどの幅が狭い画面向けにUIを小さめに表示するか
  isPlaying: boolean
  onTogglePlay: () => void
  onNextTrack: () => void
}

const AlbumArtwork = ({
  size,
  src,
  objectFit = "contain",
  smaller,
  isPlaying,
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
      {src === undefined ? (
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
            src={src}
            alt="album artwork"
            style={{
              objectFit: objectFit,
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
                  style={{ cursor: "pointer" }}
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
                  style={{ cursor: "pointer" }}
                  onClick={onNextTrack}
                />
              </Group>
            </Overlay>
          )}
        </>
      )}
    </Box>
  )
}

export default AlbumArtwork
