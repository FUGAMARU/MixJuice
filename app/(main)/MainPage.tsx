"use client"

import { Box } from "@mantine/core"
import { useRouter } from "next/navigation"
import { memo, useEffect } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { loadingAtom } from "../../atoms/loadingAtom"
import Player from "@/app/(main)/templates/Player"
import Queue from "@/app/(main)/templates/Queue"
import { queueAtom } from "@/atoms/queueAtom"
import { searchModalAtom } from "@/atoms/searchModalAtom"
import SearchModal from "@/components/templates/SearchModal"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import useBreakPoints from "@/hooks/useBreakPoints"
import usePlayer from "@/hooks/usePlayer"

const MainPage = () => {
  const router = useRouter()
  const { breakPoint, setRespVal } = useBreakPoints()
  const setIsLoading = useSetRecoilState(loadingAtom)
  const [isSearchModalOpen, setIsSearchModalOpen] =
    useRecoilState(searchModalAtom)

  useEffect(() => {
    const selectedSpotifyPlaylists = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_SELECTED_PLAYLISTS
    )
    const webDAVFolderPaths = localStorage.getItem(
      LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS
    )

    if (!selectedSpotifyPlaylists && !webDAVFolderPaths) router.push("/connect")

    setIsLoading(false)
  }, [setIsLoading, router])

  const {
    currentTrackInfo,
    playbackPercentage,
    isPlaying,
    onNextTrack,
    onTogglePlay,
    hasSomeTrack,
    onSkipTo,
    onMoveToFront,
    onAddToFront,
    checkCanMoveToFront,
    checkCanAddToFront,
    spotifyPlaybackQuality,
    isPreparingPlayback,
    onSearchModalPlay,
    onMoveNewTrackToFront,
    onAddNewTrackToFront,
    onSeekTo
  } = usePlayer({
    initialize: true
  })

  const queue = useRecoilValue(queueAtom)

  return (
    <>
      <Box w="100%" h={setRespVal("15vh", "25vh", "25vh")}>
        <Player
          currentTrackInfo={currentTrackInfo}
          playbackPercentage={playbackPercentage}
          isPlaying={isPlaying}
          onNextTrack={onNextTrack}
          onTogglePlay={onTogglePlay}
          onSeekTo={onSeekTo}
          hasSomeTrack={hasSomeTrack}
          spotifyPlaybackQuality={spotifyPlaybackQuality}
          isPreparingPlayback={isPreparingPlayback}
        />
      </Box>

      <Box w="100%">
        <Queue
          onSkipTo={onSkipTo}
          onMoveToFront={onMoveToFront}
          onAddToFront={onAddToFront}
          checkCanMoveToFront={checkCanMoveToFront}
          checkCanAddToFront={checkCanAddToFront}
        />
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

      <SearchModal
        isOpen={isSearchModalOpen}
        canMoveToFront={queue.length > 0}
        canAddToFront={queue.some(q => q.playNext)}
        onClose={() => setIsSearchModalOpen(false)}
        onSearchModalPlay={onSearchModalPlay}
        onMoveNewTrackToFront={onMoveNewTrackToFront}
        onAddNewTrackToFront={onAddNewTrackToFront}
      />
    </>
  )
}

export default memo(MainPage)
