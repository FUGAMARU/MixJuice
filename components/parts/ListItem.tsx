import { Box, Center, Flex, Text } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import Image from "next/image"
import { memo, useMemo } from "react"
import { MdOutlineLibraryMusic } from "react-icons/md"
import ArtworkOverlay from "./ArtworkOverlay"
import useBreakPoints from "@/hooks/useBreakPoints"
import { ListItemDetail } from "@/types/ListItemDetail"
import { isSquareApproximate } from "@/utils/isSquareApproximate"

type Props =
  | ({
      onArtworkPlayButtonClick: () => void
    } & Omit<ListItemDetail, "id">)
  | ({
      onArtworkPlayButtonClick?: never
    } & Omit<ListItemDetail, "id">)

const ListItem = ({
  image,
  title,
  caption,
  onArtworkPlayButtonClick
}: Props) => {
  const { setRespVal } = useBreakPoints()
  const { hovered: isArtworkHovered, ref: artworkRef } = useHover()

  /** 画像サイズが正方形に近ければ余白を消した状態(objectFit: cover)で表示する */
  const objectFit = useMemo(() => {
    if (!image) return "cover"
    return isSquareApproximate(image.width, image.height) ? "cover" : "contain"
  }, [image])

  const borderRadius = useMemo(() => "3px", [])

  return (
    <Flex align="center" gap="md" sx={{ overflow: "hidden" }}>
      <Box w="3.5rem" h="3.5rem" pos="relative" ref={artworkRef}>
        {!image ? (
          <Center h="100%" bg="#eaeaea">
            <MdOutlineLibraryMusic size="1.3rem" color="#909090" />
          </Center>
        ) : (
          <Image
            // 高さ・幅はとりあえず指定しないといけないので適当に指定
            height={250}
            width={250}
            src={image.src}
            alt="list item image"
            style={{
              objectFit,
              height: "100%",
              width: "100%",
              borderRadius
            }}
          />
        )}

        {onArtworkPlayButtonClick && (
          <ArtworkOverlay
            simplified
            isHovered={isArtworkHovered}
            borderRadius={borderRadius}
            onArtworkPlayButtonClick={onArtworkPlayButtonClick}
          />
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
          {caption}
        </Text>
      </Box>
    </Flex>
  )
}

export default memo(ListItem)
