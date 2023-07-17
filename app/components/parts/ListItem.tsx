import { Box, Flex, Overlay, Text } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import Image from "next/image"
import { useState, useEffect } from "react"
import { IoPlayCircleSharp } from "react-icons/io5"
import useBreakPoints from "@/hooks/useBreakPoints"

type Detail = {
  imgSrc: string
  objectFit?: "contain" | "cover"
  title: string
  subText: string
}

type Props =
  | ({
      playable: true
      onArtworkPlayButtonClick: () => void
    } & Detail)
  | ({
      playable?: false
      onArtworkPlayButtonClick?: never
    } & Detail)

const ListItem = ({
  imgSrc,
  objectFit = "contain",
  title,
  subText,
  playable = false,
  onArtworkPlayButtonClick
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
    <Flex align="center" gap="md">
      <Box w="3.5rem" h="3.5rem" pos="relative" ref={artworkRef}>
        <Image
          // 高さ・幅はとりあえず指定しないといけないので適当に指定
          height={250}
          width={250}
          src={imgSrc}
          alt="list item image"
          style={{
            objectFit,
            height: "100%",
            width: "100%",
            borderRadius: "3px"
          }}
        />

        {playable && isPlayerControlShown && (
          <Overlay
            className={overlayClassNames}
            center
            gradient="linear-gradient(145deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 100%)"
            opacity={0.85}
          >
            <IoPlayCircleSharp
              color="white"
              size="2rem"
              style={{ cursor: "pointer" }}
              onClick={onArtworkPlayButtonClick}
            />
          </Overlay>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Text
          fw={700}
          fz={setRespVal("1.1rem", "1.2rem", "1.2rem")}
          lh={setRespVal("1.4rem", "1.5rem", "1.5rem")}
          sx={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis"
          }}
        >
          {title}
        </Text>

        <Text
          fz={setRespVal("0.75rem", "0.85rem", "0.85rem")}
          lh={setRespVal("1.4rem", "1.5rem", "1.5rem")}
          sx={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis"
          }}
        >
          {subText}
        </Text>
      </Box>
    </Flex>
  )
}

export default ListItem
