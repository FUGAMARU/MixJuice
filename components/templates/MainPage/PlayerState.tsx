import {
  Badge,
  Box,
  Center,
  Divider,
  Flex,
  Loader,
  Popover,
  Slider,
  Text
} from "@mantine/core"
import {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useMemo,
  useState
} from "react"
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs"
import { HiVolumeOff, HiVolumeUp } from "react-icons/hi"
import TooltipDefault from "@/components/parts/TooltipDefault"
import { Provider } from "@/types/Provider"

type Props = {
  isPlaying: boolean
  isPreparingPlayback: boolean
  spotifyPlaybackQuality: string | undefined
  remainingTime: string
  currentTrackProvider: Provider | undefined
  volume: number
  setVolume: Dispatch<SetStateAction<number>>
  onTogglePlay: () => Promise<void>
}

const PlayerState = ({
  isPlaying,
  isPreparingPlayback,
  spotifyPlaybackQuality,
  remainingTime,
  currentTrackProvider,
  volume,
  setVolume,
  onTogglePlay
}: Props) => {
  const textProps = useMemo(
    () => ({
      fz: "0.85rem",
      fw: 700,
      color: "white"
    }),
    []
  )

  const [prevVolumeValue, setPrevVolumeValue] = useState(0)

  const handleVolumeIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()

      if (volume > 0) {
        setPrevVolumeValue(volume)
        setVolume(0)
        return
      }
      setVolume(prevVolumeValue)
    },
    [prevVolumeValue, volume, setVolume]
  )

  return (
    <Center
      py="0.3rem"
      pl="1rem"
      pr="2rem"
      bg="rgba(0, 0, 0, 0.6)"
      sx={{ transform: "skew(-30deg, 0deg)", borderRadius: "8px 0 0 0" }}
    >
      <Flex
        gap="xs"
        align="center"
        justify="center"
        sx={{ transform: "skew(30deg, 0deg)", color: "white" }}
      >
        {(isPreparingPlayback || currentTrackProvider === "spotify") && (
          <>
            <TooltipDefault
              label={isPreparingPlayback ? "再生準備中…" : "ストリーミング品質"}
              withArrow
            >
              {isPreparingPlayback || spotifyPlaybackQuality === undefined ? (
                <Box lh={0}>
                  <Loader color="white" size="1.1rem" />
                </Box>
              ) : (
                <Badge
                  variant="outline"
                  color="spotify"
                  styles={{
                    root: {
                      color: "white",
                      borderColor: "white",
                      cursor: "default"
                    }
                  }}
                >
                  {spotifyPlaybackQuality}
                </Badge>
              )}
            </TooltipDefault>

            <Divider orientation="vertical" />
          </>
        )}

        <Popover
          width="10rem"
          position="top"
          withArrow
          shadow="md"
          styles={{
            arrow: {
              borderWidth: 0
            }
          }}
        >
          <Popover.Target>
            <Flex align="center" gap="0.4rem" sx={{ cursor: "pointer" }}>
              <Box lh={0} onClick={handleVolumeIconClick}>
                {volume > 0 ? (
                  <HiVolumeUp size="1.2rem" />
                ) : (
                  <HiVolumeOff size="1.2rem" />
                )}
              </Box>
              <Text w="2rem" ta="right" {...textProps}>
                {volume}%
              </Text>
            </Flex>
          </Popover.Target>
          <Popover.Dropdown bg="#212529" sx={{ borderWidth: 0 }}>
            <Slider
              value={volume}
              onChange={setVolume}
              color={currentTrackProvider ?? "gray"}
              label={null}
            />
          </Popover.Dropdown>
        </Popover>

        <Divider orientation="vertical" />

        <TooltipDefault label="残り再生時間" withArrow>
          <Flex
            align="center"
            gap="0.2rem"
            sx={{ cursor: "pointer" }}
            onClick={onTogglePlay}
          >
            <Box lh={0}>
              {isPlaying ? (
                <BsFillPlayFill size="1.2rem" />
              ) : (
                <BsFillPauseFill size="1.2rem" />
              )}
            </Box>
            <Text {...textProps}>{remainingTime}</Text>
          </Flex>
        </TooltipDefault>
      </Flex>
    </Center>
  )
}

export default memo(PlayerState)
