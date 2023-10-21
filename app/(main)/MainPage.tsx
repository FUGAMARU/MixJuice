"use client"

import { Box } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useRouter } from "next/navigation"
import { memo, useCallback, useEffect, useState } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"
import { loadingAtom } from "../../atoms/loadingAtom"
import { searchModalAtom } from "@/atoms/searchModalAtom"
import MainPageLayout from "@/components/templates/MainPage/MainPageLayout"
import PlaybackHistoryModal from "@/components/templates/MainPage/PlaybackHistoryModal"
import Player from "@/components/templates/MainPage/Player"
import Queue from "@/components/templates/MainPage/Queue"
import SearchModal from "@/components/templates/MainPage/SearchModal"
import TrackModal from "@/components/templates/MainPage/TrackModal"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import useBreakPoints from "@/hooks/useBreakPoints"
import usePlayer from "@/hooks/usePlayer"
import useStorage from "@/hooks/useStorage"
import useTarckModal from "@/hooks/useTrackModal"
import { isDefined } from "@/utils/isDefined"

const MainPage = () => {
  const router = useRouter()
  const { setRespVal } = useBreakPoints()
  const { getUserData } = useStorage({ initialize: false })
  const setIsLoading = useSetRecoilState(loadingAtom)
  const [isSearchModalOpen, setIsSearchModalOpen] =
    useRecoilState(searchModalAtom)
  const [playerHeight, setPlayerHeight] = useState(0)

  const {
    isOpen: isTrackModalOpen,
    setIsOpen: setIsTrackModalOpen,
    title: trackModalTitle,
    provider: trackModalProvider,
    spotifyTracks,
    mergedWebDAVSearchResult,
    handleNavbarCheckboxLabelClick
  } = useTarckModal()

  const [
    isPlaybackHistoryModalOpen,
    { open: onOpenPlaybackHistoryModal, close: onClosePlaybackHistoryModal }
  ] = useDisclosure(false)

  useEffect(() => {
    ;(async () => {
      const selectedSpotifyPlaylists = await getUserData(
        FIRESTORE_DOCUMENT_KEYS.SPOTIFY_SELECTED_PLAYLISTS
      )
      const webDAVFolderPaths = localStorage.getItem(
        LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS
      )

      if (
        !isDefined(selectedSpotifyPlaylists) &&
        !isDefined(webDAVFolderPaths)
      ) {
        router.push("/connect")
        return
      }

      setIsLoading({
        stateChangedOn: "MainPage",
        state: false
      })
      router.prefetch("/connect")
    })()
  }, [setIsLoading, router, getUserData])

  const {
    queue,
    setQueue,
    playbackHistory,
    playbackHistoryIndex,
    currentTrackInfo,
    playbackPercentage,
    isPlaying,
    onNextTrack,
    onPreviousTrack,
    onTogglePlay,
    hasNextTrack,
    hasPreviousTrack,
    onSkipTo,
    onPlay,
    onPlayFromPlaybackHistory,
    onMoveToFront,
    onAddToFront,
    checkCanMoveToFront,
    checkCanAddToFront,
    spotifyPlaybackQuality,
    isPreparingPlayback,
    setIsPreparingPlayback,
    onMoveNewTrackToFront,
    onAddNewTrackToFront,
    onSeekTo
  } = usePlayer({
    initialize: true
  })

  const handleTrackModalClose = useCallback(() => {
    setIsTrackModalOpen(false)
  }, [setIsTrackModalOpen])

  const handlePlaybackHistoryModalClose = useCallback(() => {
    onClosePlaybackHistoryModal()
  }, [onClosePlaybackHistoryModal])

  return (
    <>
      <MainPageLayout
        isPlaying={isPlaying}
        onPlay={onPlay}
        setIsPreparingPlayback={setIsPreparingPlayback}
        setQueue={setQueue}
        onCheckboxLabelClick={handleNavbarCheckboxLabelClick}
        onPlaybackHistoryModalOpen={onOpenPlaybackHistoryModal}
      >
        <Box h={setRespVal("15vh", "25vh", "25vh")}>
          <Player
            currentTrackInfo={currentTrackInfo}
            playbackPercentage={playbackPercentage}
            isPlaying={isPlaying}
            onNextTrack={onNextTrack}
            onPreviousTrack={onPreviousTrack}
            onTogglePlay={onTogglePlay}
            onSeekTo={onSeekTo}
            hasNextTrack={hasNextTrack}
            hasPreviousTrack={hasPreviousTrack}
            spotifyPlaybackQuality={spotifyPlaybackQuality}
            isPreparingPlayback={isPreparingPlayback}
            setPlayerHeight={setPlayerHeight}
          />
        </Box>

        <Queue
          queue={queue}
          setQueue={setQueue}
          playerHeight={playerHeight}
          onSkipTo={onSkipTo}
          onMoveToFront={onMoveToFront}
          onAddToFront={onAddToFront}
          checkCanMoveToFront={checkCanMoveToFront}
          checkCanAddToFront={checkCanAddToFront}
        />
      </MainPageLayout>

      <SearchModal
        isOpen={isSearchModalOpen}
        canMoveToFront={queue.length > 0}
        canAddToFront={isPlaying}
        onClose={() => setIsSearchModalOpen(false)}
        onPlay={onPlay}
        onMoveNewTrackToFront={onMoveNewTrackToFront}
        onAddNewTrackToFront={onAddNewTrackToFront}
      />

      <TrackModal
        isOpen={isTrackModalOpen}
        title={trackModalTitle}
        provider={trackModalProvider}
        spotifyTracks={spotifyTracks}
        mergedWebDAVSearchResult={mergedWebDAVSearchResult}
        canMoveToFront={queue.length > 0}
        canAddToFront={isPlaying}
        onClose={handleTrackModalClose} // useCallbackを経由せずにコールバックで直接stateを変更すると再レンダリングが走りまくってしまい、react-windowの表示がおかしくなる。
        onPlay={onPlay}
        onMoveNewTrackToFront={onMoveNewTrackToFront}
        onAddNewTrackToFront={onAddNewTrackToFront}
      />

      <PlaybackHistoryModal
        playbackHistories={playbackHistory}
        playbackHistoryIndex={playbackHistoryIndex}
        canMoveToFront={queue.length > 0}
        canAddToFront={isPlaying}
        onPlayFromPlaybackHistory={onPlayFromPlaybackHistory}
        onMoveNewTrackToFront={onMoveNewTrackToFront}
        onAddNewTrackToFront={onAddNewTrackToFront}
        isOpen={isPlaybackHistoryModalOpen}
        onClose={handlePlaybackHistoryModalClose} // useCallbackを経由せずにコールバックで直接stateを変更すると再レンダリングが走りまくってしまい、react-windowの表示がおかしくなる。
      />
    </>
  )
}

export default memo(MainPage)
