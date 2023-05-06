import { Flex, Box, Title, Space } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { useMemo } from "react"
import Marquee from "react-easy-marquee"

type Props = {
  title: string
  artist: string
  backgroundImage: string
  smaller: boolean
  calculatedWidth: number
}

const MusicInfo: React.FC<Props> = ({
  title,
  artist,
  backgroundImage,
  smaller,
  calculatedWidth
}) => {
  const { ref: titleRef, width: titleWidth } =
    useElementSize<HTMLHeadingElement>()
  const { ref: artistRef, width: artistWidth } =
    useElementSize<HTMLHeadingElement>()

  /** padding分を考慮したMarquee切り替えのしきい値となる幅 (文字幅がこれを超えたらMarqueeが有効になる)*/
  const marqueeThresholdWidth = useMemo(
    () => calculatedWidth - 50,
    [calculatedWidth]
  )

  const isTitleMarquee = useMemo(
    () => titleWidth >= marqueeThresholdWidth,
    [titleWidth, marqueeThresholdWidth]
  )

  const isArtistMarquee = useMemo(
    () => artistWidth >= marqueeThresholdWidth,
    [artistWidth, marqueeThresholdWidth]
  )

  return (
    <Box
      w="100%"
      h="100%"
      sx={{
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      <Flex
        h="100%"
        w="100%"
        align="center"
        sx={{
          backdropFilter: "blur(10px)",
          background: `linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.0) 100%)`
        }}
      >
        <Box pl={30}>
          {/** Marqueeコンポーネントは重いのでpropsによる表示の切り替えはせず必要ない場合はそもそも表示させない */}
          {isTitleMarquee ? (
            <Marquee
              width={`${marqueeThresholdWidth}px`}
              height={smaller ? "1.5rem" : "2.5rem"}
              duration={20000}
              reverse
            >
              <Title
                ref={titleRef}
                pr="10rem"
                order={smaller ? 3 : 1}
                color="white"
                display="inline-block"
                sx={{ whiteSpace: "nowrap" }}
              >
                {title}
              </Title>
            </Marquee>
          ) : (
            <Box h={smaller ? "1.5rem" : "2.5rem"}>
              <Title
                ref={titleRef}
                h={smaller ? "1.5rem" : "2.5rem"}
                order={smaller ? 3 : 1}
                color="white"
                display="inline-block"
                sx={{ whiteSpace: "nowrap" }}
              >
                {title}
              </Title>
            </Box>
          )}

          <Space h="0.5rem" />

          {isArtistMarquee ? (
            <Marquee
              width={`${marqueeThresholdWidth}px`}
              height={smaller ? "1.5rem" : "2.5rem"}
              duration={20000}
              reverse
            >
              <Title
                ref={artistRef}
                pr="10rem"
                order={smaller ? 4 : 2}
                color="white"
                display="inline-block"
                sx={{ whiteSpace: "nowrap" }}
              >
                {`/ ${artist}`}
              </Title>
            </Marquee>
          ) : (
            <Box h={smaller ? "1.5rem" : "2.5rem"}>
              <Title
                ref={artistRef}
                order={smaller ? 4 : 2}
                color="white"
                display="inline-block"
                sx={{ whiteSpace: "nowrap" }}
              >
                {`/ ${artist}`}
              </Title>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  )
}

export default MusicInfo
