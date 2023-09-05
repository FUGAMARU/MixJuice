import { Box, Center } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import Image from "next/image"
import { memo, useMemo } from "react"

import { MdOutlineLibraryMusic } from "react-icons/md"
import ArtworkOverlay from "../../parts/ArtworkOverlay"
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
  isTrackAvailable: boolean
  onTogglePlay: () => Promise<void>
  onNextTrack: () => Promise<void>
}

const AlbumArtwork = ({
  size,
  image,
  smaller,
  isPlaying,
  isPreparingPlayback,
  isTrackAvailable,
  onTogglePlay,
  onNextTrack
}: Props) => {
  const { setRespVal } = useBreakPoints()
  const { hovered: isArtworkHovered, ref: artworkRef } = useHover()

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
      )}

      <ArtworkOverlay
        isHovered={isArtworkHovered}
        smaller={smaller}
        isPlaying={isPlaying}
        isPreparingPlayback={isPreparingPlayback}
        isTrackAvailable={isTrackAvailable}
        onTogglePlay={onTogglePlay}
        onNextTrack={onNextTrack}
      />
    </Box>
  )
}

export default memo(AlbumArtwork)
