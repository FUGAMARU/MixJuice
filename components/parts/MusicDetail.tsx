import { Box, Flex, Space, Text } from "@mantine/core"
import Image from "next/image"
import useBreakPoints from "@/hooks/useBreakPoints"

type Props = {
  idx: number
  artworkSrc: string
  title: string
  artist: string
}

const MusicDetail: React.FC<Props> = ({ idx, artworkSrc, title, artist }) => {
  const { setRespVal } = useBreakPoints()

  return (
    <Flex px={setRespVal("0.4rem", "0.5rem", "2rem")} align="center">
      <Text miw="1rem" ta="center" ff="GreycliffCF" fz="1.1rem">
        {idx}
      </Text>

      <Space w="md" />

      <Box w="3.5rem" h="3.5rem">
        <Image
          // 高さ・幅はとりあえず指定しないといけないので適当に指定
          height={250}
          width={250}
          src={artworkSrc}
          alt="album artwork"
          style={{
            objectFit: "contain",
            height: "100%",
            width: "100%"
          }}
        />
      </Box>

      <Space w="md" />

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Text
          fw={700}
          fz={setRespVal("1.1rem", "1.2rem", "1.2rem")}
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
          sx={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis"
          }}
        >
          / {artist}
        </Text>
      </Box>
    </Flex>
  )
}

export default MusicDetail
