import { Box, Flex } from "@mantine/core"
import { useElementSize, useMediaQuery } from "@mantine/hooks"
import AlbumArtwork from "../parts/AlbumArtwork"
import MusicInfo from "../parts/MusicInfo"
import styles from "@/styles/Player.module.css"

const Player: React.FC = () => {
  const { ref: containerRef, height: containerHeight } = useElementSize()

  /** 横幅がタブレットサイズ以上か */
  const isSmallerThanTablet = useMediaQuery("(max-width: 47em)")

  // 開発用
  const title = "流線型メーデー"
  const title2 =
    "めちゃ長いタイトルめちゃ長いタイトルめちゃ長いタイトルめちゃ長いタイトル"
  const artist = "花譜, 可不"
  const artist2 =
    "めちゃめちゃ長いアーティスト名めちゃめちゃ長いアーティスト名めちゃめちゃ長いアーティスト名"
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
          title={title}
          artist={artist}
          backgroundImage={artworkUrl}
          smaller={isSmallerThanTablet}
        />
      </Flex>

      {/** wを再生時間の割合と同期させる */}
      <Box className={styles.loader} w="30%" h="0.3rem" bg="spotify" />
    </>
  )
}

export default Player
