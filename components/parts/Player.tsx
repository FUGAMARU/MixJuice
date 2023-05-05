import {
  Box,
  Flex,
  Overlay,
  Title,
  Group,
  BackgroundImage
} from "@mantine/core"
import { useElementSize, useHover, useMediaQuery } from "@mantine/hooks"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import Marquee from "react-fast-marquee"
import { IoPlayCircleSharp, IoPlayBack, IoPlayForward } from "react-icons/io5"
import styles from "@/styles/Player.module.css"

const Player: React.FC = () => {
  const {
    ref: containerRef,
    width: containerWidth,
    height: containerHeight
  } = useElementSize()
  const { ref: titleRef, width: titleWidth } = useElementSize()
  const { ref: artistRef, width: artistWidth } = useElementSize()
  // 楽曲タイトルが長すぎるかどうか
  const isTitleMarquee = useMemo(
    () => titleWidth > containerWidth,
    [containerWidth, titleWidth]
  )
  // アーティスト名が長すぎるかどうか
  const isArtistMarquee = useMemo(
    () => artistWidth > containerWidth,
    [containerWidth, artistWidth]
  )

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

  /** 横幅がタブレットサイズ以上か */
  const isLargerThanTablet = useMediaQuery("(min-width: 48em)")

  // 開発用
  const title = "流線型メーデー"
  //const title =
  ;("めちゃ長いタイトルめちゃ長いタイトルめちゃ長いタイトルめちゃ長いタイトルめちゃ長いタイトルめちゃ長いタイトルめちゃ長いタイトルめちゃ長いタイトル")
  const artist = "花譜, 可不"
  //const artist =
  ;("めちゃめちゃ長いアーティスト名めちゃめちゃ長いアーティスト名めちゃめちゃ長いアーティスト名めちゃめちゃ長いアーティスト名めちゃめちゃ長いアーティスト名めちゃめちゃ長いアーティスト名")
  const artworkUrl =
    "https://m.media-amazon.com/images/I/61JXT+EUkYL._UXNaN_FMjpg_QL85_.jpg"

  return (
    <>
      <Flex w="100%" h="100%" ref={containerRef}>
        <Box
          h="100%"
          w={containerHeight}
          ref={artworkRef}
          bg="white"
          pos="relative"
          sx={{ flexShrink: 0 }}
        >
          <Image
            // 高さ・幅はとりあえず指定しないといけないので適当に指定
            height={1000}
            width={1000}
            src={artworkUrl}
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
              <Group
                position="center"
                spacing={isLargerThanTablet ? "lg" : "xs"}
              >
                <IoPlayBack
                  color="white"
                  size={isLargerThanTablet ? "2rem" : "1.5rem"}
                  style={{ cursor: "pointer" }}
                />
                <IoPlayCircleSharp
                  color="white"
                  size={isLargerThanTablet ? "3rem" : "2rem"}
                  style={{ cursor: "pointer" }}
                />
                <IoPlayForward
                  color="white"
                  size={isLargerThanTablet ? "2rem" : "1.5rem"}
                  style={{ cursor: "pointer" }}
                />
              </Group>
            </Overlay>
          )}
        </Box>

        <BackgroundImage w="100%" h="100%" src={artworkUrl}>
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
              <Marquee play={isTitleMarquee} style={{ overflowY: "hidden" }}>
                <Title
                  ref={titleRef}
                  order={isLargerThanTablet ? 1 : 3}
                  color="white"
                  sx={{
                    whiteSpace: "nowrap"
                  }}
                >
                  {title}
                </Title>
              </Marquee>

              <Marquee play={isArtistMarquee} style={{ overflowY: "hidden" }}>
                <Title
                  ref={artistRef}
                  pl={20}
                  order={isLargerThanTablet ? 2 : 4}
                  color="white"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {artist}
                </Title>
              </Marquee>
            </Box>
          </Flex>
        </BackgroundImage>
      </Flex>

      {/** wを再生時間の割合と同期させる */}
      <Box className={styles.loader} w="30%" h="0.3rem" bg="spotify" />
    </>
  )
}

export default Player
