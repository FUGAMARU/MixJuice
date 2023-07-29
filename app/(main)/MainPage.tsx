"use client"

import { Box } from "@mantine/core"
import { memo, useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { loadingAtom } from "../../atoms/loadingAtom"
import Player from "@/app/(main)/templates/Player"
import Queue from "@/app/(main)/templates/Queue"
import useBreakPoints from "@/hooks/useBreakPoints"
import usePlayer from "@/hooks/usePlayer"

const MainPage = () => {
  const { breakPoint, setRespVal } = useBreakPoints()
  const setIsLoading = useSetRecoilState(loadingAtom)

  useEffect(() => {
    setIsLoading(false)
  }, [setIsLoading])

  const {
    currentTrackInfo,
    playbackPercentage,
    isPlaying,
    onNextTrack,
    onTogglePlay,
    hasSomeTrack,
    onSkipTo,
    onMoveToFront
  } = usePlayer({
    initialize: true
  })

  return (
    <>
      <Box w="100%" h={setRespVal("15vh", "25vh", "25vh")}>
        <Player
          currentTrackInfo={currentTrackInfo}
          playbackPercentage={playbackPercentage}
          isPlaying={isPlaying}
          onNextTrack={onNextTrack}
          onTogglePlay={onTogglePlay}
          hasSomeTrack={hasSomeTrack}
        />
      </Box>

      <Box w="100%">
        <Queue onSkipTo={onSkipTo} onMoveToFront={onMoveToFront} />
      </Box>

      <Box
        w="6rem"
        p="xs"
        ta="center"
        pos="absolute"
        bottom={15}
        right={15}
        bg="white"
        c="#0a83ff"
        fz="xs"
        sx={{ borderRadius: "20px", boxShadow: "0 0 4px rgba(0, 0, 0, 0.2);" }}
      >
        {breakPoint}
      </Box>
    </>
  )
}

export default memo(MainPage)
