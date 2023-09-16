"use client"

import { Box } from "@mantine/core"
import { useRouter } from "next/navigation"
import { memo, useCallback, useEffect, useState } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { loadingAtom } from "../../atoms/loadingAtom"
import { queueAtom } from "@/atoms/queueAtom"
import { searchModalAtom } from "@/atoms/searchModalAtom"
import MainPageLayout from "@/components/templates/MainPage/MainPageLayout"
import Player from "@/components/templates/MainPage/Player"
import Queue from "@/components/templates/MainPage/Queue"
import SearchModal from "@/components/templates/MainPage/SearchModal"
import TrackModal from "@/components/templates/MainPage/TrackModal"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import useBreakPoints from "@/hooks/useBreakPoints"
import usePlayer from "@/hooks/usePlayer"
import useTarckModal from "@/hooks/useTrackModal"

const MainPage = () => {
  const router = useRouter()
  const { setRespVal } = useBreakPoints()
  const setIsLoading = useSetRecoilState(loadingAtom)
  const [isSearchModalOpen, setIsSearchModalOpen] =
    useRecoilState(searchModalAtom)
  const [playerHeight, setPlayerHeight] = useState(0)

  const {
    isOpen: isTrackModalOpen,
    setIsOpen: setIsTrackModalOpen,
    title: trackModalTitle,
    provider: trackModalProvider,
    tracks: tracksForTrackModal,
    handleNavbarCheckboxLabelClick
  } = useTarckModal()

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
    onPlay,
    onMoveToFront,
    onAddToFront,
    checkCanMoveToFront,
    checkCanAddToFront,
    spotifyPlaybackQuality,
    isPreparingPlayback,
    setIsPreparingPlayback,
    onPlayWithTrackInfo,
    onMoveNewTrackToFront,
    onAddNewTrackToFront,
    onSeekTo
  } = usePlayer({
    initialize: true
  })

  const queue = useRecoilValue(queueAtom)

  const handleTrackModalClose = useCallback(() => {
    setIsTrackModalOpen(false)
  }, [setIsTrackModalOpen])

  return (
    <>
      <MainPageLayout
        isPlaying={isPlaying}
        onPlay={onPlay}
        setIsPreparingPlayback={setIsPreparingPlayback}
        onCheckboxLabelClick={handleNavbarCheckboxLabelClick}
      >
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
            setPlayerHeight={setPlayerHeight}
          />
        </Box>

        <Box w="100%">
          <Queue
            playerHeight={playerHeight}
            onSkipTo={onSkipTo}
            onMoveToFront={onMoveToFront}
            onAddToFront={onAddToFront}
            checkCanMoveToFront={checkCanMoveToFront}
            checkCanAddToFront={checkCanAddToFront}
          />
        </Box>
      </MainPageLayout>

      <SearchModal
        isOpen={isSearchModalOpen}
        canMoveToFront={queue.length > 0}
        canAddToFront={isPlaying}
        onClose={() => setIsSearchModalOpen(false)}
        onPlayWithTrackInfo={onPlayWithTrackInfo}
        onMoveNewTrackToFront={onMoveNewTrackToFront}
        onAddNewTrackToFront={onAddNewTrackToFront}
      />

      <TrackModal
        isOpen={isTrackModalOpen}
        title={trackModalTitle}
        provider={trackModalProvider}
        tracks={tracksForTrackModal}
        canMoveToFront={queue.length > 0}
        canAddToFront={isPlaying}
        onClose={handleTrackModalClose} // useCallbackを経由せずにコールバックで直接stateを変更すると再レンダリングが走りまくってしまい、react-windowの表示がおかしくなる。
        onPlayWithTrackInfo={onPlayWithTrackInfo}
        onMoveNewTrackToFront={onMoveNewTrackToFront}
        onAddNewTrackToFront={onAddNewTrackToFront}
      />
    </>
  )
}

export default memo(MainPage)
