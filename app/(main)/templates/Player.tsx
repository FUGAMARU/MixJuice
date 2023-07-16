import { Box, Flex } from "@mantine/core"
import { useElementSize } from "@mantine/hooks"
import { useEffect, useMemo } from "react"
import { useSetRecoilState } from "recoil"
import AlbumArtwork from "../../components/parts/AlbumArtwork"
import MusicInfo from "../../components/parts/MusicInfo"
import { playerHeightAtom } from "@/atoms/playerHeightAtom"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useBreakPoints from "@/hooks/useBreakPoints"
import usePlayer from "@/hooks/usePlayer"
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

  const { currentMusicInfo, playbackPosition, onNextTrack } = usePlayer()

  return (
    <>
      <Flex w="100%" h="100%" ref={containerRef}>
        <AlbumArtwork
          size={containerHeight}
          src={currentMusicInfo?.imgSrc || ""}
          smaller={isSmallerThanTablet}
          onNextTrack={onNextTrack}
        />

        <MusicInfo
          title={currentMusicInfo?.title || "再生待機中…"}
          artist={currentMusicInfo?.artist || "再生待機中…"}
          backgroundImage={currentMusicInfo?.imgSrc || ""}
          smaller={isSmallerThanTablet}
          calculatedWidth={containerWidth - containerHeight}
        />
      </Flex>

      {/** wを再生時間の割合と同期させる */}
      <Box
        className={styles.loader}
        w={`${playbackPosition}%`}
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
