import { Flex, Loader } from "@mantine/core"
import Image from "next/image"
import { memo, useCallback } from "react"
import ListItem from "@/components/parts/ListItem"
import ListItemContainer from "@/components/parts/ListItemContainer"
import ModalDefault from "@/components/parts/ModalDefault"
import QueueOperator from "@/components/parts/QueueOperator"
import { Provider } from "@/types/Provider"
import { Track } from "@/types/Track"

type Props = {
  isOpen: boolean
  title: string
  provider: Provider | undefined
  tracks: Track[] | undefined
  canMoveToFront: boolean
  canAddToFront: boolean
  onClose: () => void
  onPlayWithTrackInfo: (track: Track) => Promise<void>
  onMoveNewTrackToFront: (track: Track) => void
  onAddNewTrackToFront: (track: Track) => void
}

const TrackModal = ({
  isOpen,
  title,
  provider,
  tracks,
  canMoveToFront,
  canAddToFront,
  onClose,
  onPlayWithTrackInfo,
  onMoveNewTrackToFront,
  onAddNewTrackToFront
}: Props) => {
  const handleArtworkPlayButtonClick = useCallback(
    async (track: Track) => {
      onClose()
      await onPlayWithTrackInfo(track)
    },
    [onClose, onPlayWithTrackInfo]
  )

  return (
    <ModalDefault
      height="30rem"
      title={
        <Flex align="center" gap="xs">
          {provider && (
            <Image
              src={
                provider === "spotify"
                  ? "/spotify-logo.png"
                  : "/server-icon.png"
              }
              height={28}
              width={28}
              alt="Provider's logo"
            />
          )}
          {title}
          {tracks === undefined && <Loader color={provider} size="1.2rem" />}
        </Flex>
      }
      isOpen={isOpen}
      onClose={onClose}
      withoutCloseButton
    >
      {tracks?.map(track => (
        <ListItemContainer key={track.id}>
          <Flex
            align="center"
            justify="space-between"
            sx={{ flex: "1", overflow: "hidden" }}
          >
            <ListItem
              image={track.image}
              title={track.title}
              caption={track.artist}
              onArtworkPlayButtonClick={() =>
                handleArtworkPlayButtonClick(track)
              }
            />

            <QueueOperator
              canMoveToFront={canMoveToFront}
              canAddToFront={canAddToFront}
              onMoveToFront={() => onMoveNewTrackToFront(track)}
              onAddToFront={() => onAddNewTrackToFront(track)}
              animated
            />
          </Flex>
        </ListItemContainer>
      ))}
    </ModalDefault>
  )
}

export default memo(TrackModal)
