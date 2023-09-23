import { Flex, Box, Title, Space } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { memo, useMemo } from "react"
import Marquee from "react-easy-marquee"

type Props = {
  title: string
  artist: string
  backgroundImage: string
  smaller: boolean
  calculatedWidth: number
}

const TrackInfo = ({
  title,
  artist,
  backgroundImage,
  smaller,
  calculatedWidth
}: Props) => {
  const { ref: titleRef, width: titleWidth } =
    useElementSize<HTMLHeadingElement>()
  const { ref: artistRef, width: artistWidth } =
    useElementSize<HTMLHeadingElement>()

  /** padding分を考慮したMarquee切り替えのしきい値となる幅 (文字幅がこれを超えたらMarqueeが有効になる)*/
  const marqueeThresholdWidth = useMemo(
    () => calculatedWidth - 30,
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
      maw={calculatedWidth}
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <Flex
        h="100%"
        align="center"
        justify={isTitleMarquee ? "end" : ""}
        sx={{
          backdropFilter: "blur(10px)",
          background: `linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.0) 100%)`
        }}
      >
        <Box pl={isTitleMarquee ? 0 : 30}>
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
            <Flex h={smaller ? "1.5rem" : "2.5rem"} align="center">
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
            </Flex>
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
            <Flex h={smaller ? "1.5rem" : "2.5rem"} align="center">
              <Title
                ref={artistRef}
                order={smaller ? 4 : 2}
                color="white"
                display="inline-block"
                sx={{ whiteSpace: "nowrap" }}
              >
                {`/ ${artist}`}
              </Title>
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  )
}

export default memo(TrackInfo)
