import { Flex, Loader } from "@mantine/core"
import Image from "next/image"
import { memo, useCallback } from "react"
import { FixedSizeList } from "react-window"
import ListItem from "@/components/parts/ListItem"
import ListItemContainer from "@/components/parts/ListItemContainer"
import ModalDefault from "@/components/parts/ModalDefault"
import QueueOperator from "@/components/parts/QueueOperator"
import { PROVIDER_ICON_SRC } from "@/constants/ProviderIconSrc"
import { Provider } from "@/types/Provider"
import { Track } from "@/types/Track"
import { remToPx } from "@/utils/remToPx"

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
      title={
        <Flex align="center" gap="xs">
          {provider && (
            <Image
              src={PROVIDER_ICON_SRC[provider]}
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
      {tracks && (
        <FixedSizeList
          width="100%"
          height={remToPx(30)}
          itemCount={tracks.length}
          itemSize={80} // キューのアイテム1つ分の高さ
        >
          {({ index, style }) => {
            const track = tracks[index]
            return (
              <div style={style}>
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
              </div>
            )
          }}
        </FixedSizeList>
      )}
    </ModalDefault>
  )
}

export default memo(TrackModal)
