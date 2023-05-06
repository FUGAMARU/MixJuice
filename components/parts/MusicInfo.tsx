import { BackgroundImage, Flex, Box, Title, Space } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { useMemo } from "react"
import Marquee from "react-easy-marquee"

type Props = {
  title: string
  artist: string
  backgroundImage: string
  smaller: boolean
}

const MusicInfo: React.FC<Props> = ({
  title,
  artist,
  backgroundImage,
  smaller
}) => {
  const { ref: containerRef, width: containerWidth } =
    useElementSize<HTMLDivElement>()
  const { ref: titleRef, width: titleWidth } =
    useElementSize<HTMLHeadingElement>()
  const { ref: artistRef, width: artistWidth } =
    useElementSize<HTMLHeadingElement>()
  // 楽曲タイトルがはみ出たらMarquee
  const isTitleMarquee = useMemo(
    () => titleWidth > containerWidth,
    [containerWidth, titleWidth]
  )
  // アーティスト名がはみ出たらMarquee
  const isArtistMarquee = useMemo(
    () => artistWidth > containerWidth,
    [containerWidth, artistWidth]
  )

  return (
    <BackgroundImage w="100%" h="100%" src={backgroundImage} ref={containerRef}>
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
              width={`${containerWidth}px`}
              height={smaller ? "1.7rem" : "2.5rem"}
              duration={20000}
              reverse
            >
              <Title
                ref={titleRef}
                pr="10rem"
                order={smaller ? 3 : 1}
                color="white"
                sx={{ whiteSpace: "nowrap" }}
              >
                {title}
              </Title>
            </Marquee>
          ) : (
            <Box h={smaller ? "1.7rem" : "2.5rem"}>
              <Title
                ref={titleRef}
                order={smaller ? 3 : 1}
                color="white"
                sx={{ whiteSpace: "nowrap" }}
              >
                {title}
              </Title>
            </Box>
          )}

          <Space h="0.3rem" />

          {isArtistMarquee ? (
            <Marquee
              width={`${containerWidth}px`}
              height={smaller ? "1.7rem" : "2.5rem"}
              duration={20000}
              reverse
            >
              <Title
                ref={artistRef}
                pr="10rem"
                order={smaller ? 4 : 2}
                color="white"
                sx={{ whiteSpace: "nowrap" }}
              >
                {`/ ${artist}`}
              </Title>
            </Marquee>
          ) : (
            <Box h={smaller ? "1.7rem" : "2.5rem"}>
              <Title
                ref={artistRef}
                order={smaller ? 4 : 2}
                color="white"
                sx={{ whiteSpace: "nowrap" }}
              >
                {`/ ${artist}`}
              </Title>
            </Box>
          )}
        </Box>
      </Flex>
    </BackgroundImage>
  )
}

export default MusicInfo
