import { Box, Flex } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { useEffect, useMemo } from "react"
import { useSetRecoilState } from "recoil"
import AlbumArtwork from "../../components/parts/AlbumArtwork"
import MusicInfo from "../../components/parts/MusicInfo"
import { playerHeightAtom } from "@/atoms/playerHeightAtom"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import styles from "@/styles/Player.module.css"

const Player = () => {
  const { breakPoint } = useBreakPoints()
  const {
    ref: containerRef,
    height: containerHeight,
    width: containerWidth
  } = useElementSize()

  const setPlayerHeight = useSetRecoilState(playerHeightAtom)
  useEffect(() => {
    setPlayerHeight(containerHeight)
  }, [containerHeight, setPlayerHeight])

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
          title={title}
          artist={artist}
          backgroundImage={artworkUrl}
          smaller={isSmallerThanTablet}
          calculatedWidth={containerWidth - containerHeight}
        />
      </Flex>

      {/** wを再生時間の割合と同期させる */}
      <Box
        className={styles.loader}
        w="30%"
        h="0.3rem"
        bg="spotify"
        sx={{
          ":before": {
            zIndex: ZINDEX_NUMBERS.SEEKBAR_LINE
          },
          ":after": {
            zIndex: ZINDEX_NUMBERS.SEEKBAR_CIRCLE
          }
        }}
      />
    </>
  )
}

export default Player
