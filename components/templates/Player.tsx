import { Box, Flex } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { useMemo } from "react"
import AlbumArtwork from "../parts/AlbumArtwork"
import MusicInfo from "../parts/MusicInfo"
import useBreakPoints from "@/hooks/useBreakPoints"
import styles from "@/styles/Player.module.css"

const Player: React.FC = () => {
  const { breakPoint } = useBreakPoints()
  const {
    ref: containerRef,
    height: containerHeight,
    width: containerWidth
  } = useElementSize()

  /** 横幅がタブレットサイズ以上か */
  const isSmallerThanTablet = useMemo(
    () => !(breakPoint === "PC" || breakPoint === "Tablet"),
    [breakPoint]
  )

  // 開発用
  const title = "流線型メーデー"
  const title2 = "ラ♪ラ♪ラ♪スイートプリキュア♪〜∞UNLIMITED∞ ver.〜"
  const artist = "花譜, 可不"
  const artist2 =
    "内田雄馬, 内田雄馬 with 石川界人, 榎木淳弥, 斉藤壮馬, 畠中祐, 花江夏樹, 八代択"
  const artworkUrl =
    "https://m.media-amazon.com/images/I/61JXT+EUkYL._UXNaN_FMjpg_QL85_.jpg"

  return (
    <>
      <Flex w="100%" h="100%" ref={containerRef}>
        <AlbumArtwork
          size={containerHeight}
          src={artworkUrl}
          smaller={isSmallerThanTablet}
        />

        <MusicInfo
          title={title2}
          artist={artist2}
          backgroundImage={artworkUrl}
          smaller={isSmallerThanTablet}
          calculatedWidth={containerWidth - containerHeight}
        />
      </Flex>

      {/** wを再生時間の割合と同期させる */}
      <Box className={styles.loader} w="30%" h="0.3rem" bg="spotify" />
    </>
  )
}

export default Player
