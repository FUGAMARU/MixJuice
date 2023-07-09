import { Box, Flex, Text } from "@mantine/core"
import Image from "next/image"
import useBreakPoints from "@/hooks/useBreakPoints"

type Detail = {
  imgSrc: string
  title: string
  subText: string
}

type Props =
  | ({
      idx?: number
      noIndex: true
    } & Detail)
  | ({
      idx: number
      noIndex?: false
    } & Detail)

const ListItem = ({ idx, noIndex = false, imgSrc, title, subText }: Props) => {
  const { setRespVal } = useBreakPoints()

  return (
    <Flex align="center" gap="md">
      {!noIndex && (
        <Text miw="1rem" ta="center" ff="GreycliffCF" fz="1.1rem">
          {idx}
        </Text>
      )}

      <Box w="3.5rem" h="3.5rem">
        <Image
          // 高さ・幅はとりあえず指定しないといけないので適当に指定
          height={250}
          width={250}
          src={imgSrc}
          alt="list item image"
          style={{
            objectFit: "contain",
            height: "100%",
            width: "100%",
            borderRadius: "3px"
          }}
        />
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
