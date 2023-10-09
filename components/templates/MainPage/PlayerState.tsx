import { Badge, Box, Center, Divider, Flex, Loader, Text } from "@mantine/core"
import { memo, useMemo } from "react"
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs"
import { HiVolumeUp } from "react-icons/hi"
import TooltipDefault from "@/components/parts/TooltipDefault"
import { Provider } from "@/types/Provider"

type Props = {
  isPlaying: boolean
  isPreparingPlayback: boolean
  spotifyPlaybackQuality: string | undefined
  remainingTime: string
  currentTrackProvider: Provider | undefined
  onTogglePlay: () => Promise<void>
}

const PlayerState = ({
  isPlaying,
  isPreparingPlayback,
  spotifyPlaybackQuality,
  remainingTime,
  currentTrackProvider,
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

        <Flex align="center" gap="0.4rem">
          <Box lh={0}>
            <HiVolumeUp size="1.2rem" />
          </Box>
          <Text {...textProps}>0%</Text>
        </Flex>

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
