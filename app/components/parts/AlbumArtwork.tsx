import { Box, Overlay, Group } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import Image from "next/image"
import { useState, useEffect } from "react"
import { IoPlayBack, IoPlayCircleSharp, IoPlayForward } from "react-icons/io5"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"

type Props = {
  size: number
  src: string
  smaller: boolean // スマホなどの幅が狭い画面向けにUIを小さめに表示するか
}

const AlbumArtwork = ({ size, src, smaller }: Props) => {
  /** プレイヤーコントロールホバー時アニメーション管理 */
  const { hovered: isArtworkHovered, ref: artworkRef } = useHover()
  const [isPlayerControlShown, setPlayerControlShown] = useState(false)
  const [artworkClassNames, setArtworkClassNames] = useState("")
  useEffect(() => {
    const prefix = "animate__animated animate__faster"

    if (isArtworkHovered) {
      setArtworkClassNames(`${prefix} animate__fadeIn`)
      setPlayerControlShown(true)
    } else {
      setArtworkClassNames(`${prefix} animate__fadeOut`)
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
      sx={{ flexShrink: 0, zIndex: ZINDEX_NUMBERS.ALBUM_ARTWORK }}
    >
      <Image
        // 高さ・幅はとりあえず指定しないといけないので適当に指定
        height={1000}
        width={1000}
        src={src}
        alt="album artwork"
        style={{
          objectFit: "contain",
          height: "100%",
          width: "100%"
        }}
      />
      {isPlayerControlShown && (
        <Overlay
          className={artworkClassNames}
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
            <IoPlayCircleSharp
              color="white"
              size={smaller ? "2rem" : "3rem"}
              style={{ cursor: "pointer" }}
            />
            <IoPlayForward
              color="white"
              size={smaller ? "1.5rem" : "2rem"}
              style={{ cursor: "pointer" }}
            />
          </Group>
        </Overlay>
      )}
    </Box>
  )
}

export default AlbumArtwork
