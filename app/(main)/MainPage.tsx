"use client"

import { Box, Flex } from "@mantine/core"
import { useRouter } from "next/navigation"
import { memo, useEffect, useMemo, useState } from "react"
import { Rnd } from "react-rnd"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { loadingAtom } from "../../atoms/loadingAtom"
import Player from "@/app/(main)/templates/Player"
import Queue from "@/app/(main)/templates/Queue"
import { queueAtom } from "@/atoms/queueAtom"
import { searchModalAtom } from "@/atoms/searchModalAtom"
import LayoutNavbar from "@/components/layout/LayoutNavbar"
import SearchModal from "@/components/templates/SearchModal"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { HEADER_HEIGHT } from "@/constants/Styling"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
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

  const [navbarDraggedWidth, setNavbarDraggedWidth] = useState(0)
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.NAVBAR_DRAGGED_WIDTH)
    if (data) setNavbarDraggedWidth(Number(data))
  }, [])

  const defaultNavbarWidth = useMemo(() => {
    if (breakPoint === "SmartPhone") return "60%"
    if (breakPoint === "Tablet") return "40%"

    /** PCの場合 */
    if (navbarDraggedWidth) return Number(navbarDraggedWidth)
    return "20%"
  }, [breakPoint, navbarDraggedWidth])
  const screenHeightWithoutHeader = useMemo(
    () => `calc(100vh - ${HEADER_HEIGHT}px)`,
    []
  )

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
      <Flex>
        {breakPoint === "PC" ? (
          <Rnd
            default={{
              x: 0,
              y: 0,
              width: defaultNavbarWidth,
              height: screenHeightWithoutHeader
            }}
            onResize={(_, __, ref, ___, ____) =>
              localStorage.setItem(
                LOCAL_STORAGE_KEYS.NAVBAR_DRAGGED_WIDTH,
                String(ref.offsetWidth)
              )
            }
            enableResizing={{ right: true }}
            disableDragging
            style={{
              position: "relative",
              zIndex: ZINDEX_NUMBERS.NAVBAR_EXPANDED
            }}
          >
            <LayoutNavbar isPlaying={isPlaying} onPlay={onPlay} />
          </Rnd>
        ) : (
          <Box
            w={defaultNavbarWidth}
            h={screenHeightWithoutHeader}
            pos="absolute"
            left={0}
            sx={{ zIndex: ZINDEX_NUMBERS.NAVBAR_COLLAPSED }}
          >
            <LayoutNavbar isPlaying={isPlaying} onPlay={onPlay} />
          </Box>
        )}

        <Box w="100%" sx={{ flex: 1 }}>
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
            sx={{
              borderRadius: "20px",
              boxShadow: "0 0 4px rgba(0, 0, 0, 0.2);"
            }}
          >
            {breakPoint}
          </Box>
        </Box>
      </Flex>

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
