import { Box, Button, Flex, Paper, Text } from "@mantine/core"
import { useViewportSize } from "@mantine/hooks"
import { memo, useCallback, useMemo, useState } from "react"
import { FixedSizeList } from "react-window"
import { useRecoilValue } from "recoil"
import { queueAtom } from "@/atoms/queueAtom"
import GradientCircle from "@/components/parts/GradientCircle"
import ListItem from "@/components/parts/ListItem"
import QueueOperator from "@/components/parts/QueueOperator"
import { PROVIDER_NAME } from "@/constants/ProviderName"
import { STYLING_VALUES } from "@/constants/StylingValues"
import useBreakPoints from "@/hooks/useBreakPoints"
import useErrorModal from "@/hooks/useErrorModal"

type Props = {
  playerHeight: number
  onSkipTo: (trackId: string) => Promise<void>
  onMoveToFront: (trackId: string) => void
  onAddToFront: (trackId: string) => void
  checkCanMoveToFront: (idx: number) => boolean
  checkCanAddToFront: (idx: number, nextPlay: boolean) => boolean
}

const Queue = ({
  playerHeight,
  onSkipTo,
  onMoveToFront,
  onAddToFront,
  checkCanMoveToFront,
  checkCanAddToFront
}: Props) => {
  const { setRespVal } = useBreakPoints()
  const { showError } = useErrorModal()
  const { height: viewportHeight } = useViewportSize()
  const scrollAreaHeight = useMemo(
    () => viewportHeight - STYLING_VALUES.HEADER_HEIGHT - playerHeight,
    [viewportHeight, playerHeight]
  )
  const queue = useRecoilValue(queueAtom)

  const handleArtworkPlayButtonClick = useCallback(
    async (id: string) => {
      try {
        await onSkipTo(id)
      } catch (e) {
        showError(e)
      }
    },
    [onSkipTo, showError]
  )

  const [pineconeClassNames, setPineconeClassNames] = useState("")
  const handleMiniMixButtonClick = useCallback(async () => {
    if (pineconeClassNames !== "") return

    setPineconeClassNames(
      "animate__animated  animate__faster animate__fadeInDown"
    )
    await new Promise(resolve => setTimeout(resolve, 600))
    setPineconeClassNames(
      "animate__animated  animate__faster animate__slideOutUp"
    )
    await new Promise(resolve => setTimeout(resolve, 600))
    setPineconeClassNames("")
  }, [pineconeClassNames])

  return (
    <Box
      h={scrollAreaHeight}
      px={setRespVal("0.5rem", "0.5rem", "1.5rem")}
      pt={`${STYLING_VALUES.QUEUE_PADDING_TOP}px`}
    >
      {queue.length === 0 && (
        <Paper
          w="fit-content"
          mx="auto"
          mt="xs"
          px="1rem"
          py="0.5rem"
          bg="white"
          ta="center"
          shadow="lg"
          radius="xl"
          sx={{ cursor: "default" }}
          pos="relative"
        >
          <Flex
            align="center"
            gap="0.2rem"
            fw={500}
            fz={setRespVal("0.7rem", "0.8rem", "0.8rem")}
          >
            <Text>プレイリストを選択して</Text>
            <Button
              size="xs"
              compact
              ff="GreycliffCF"
              fw={800}
              variant="gradient"
              gradient={{ from: "#2afadf", to: "#4c83ff" }}
              onClick={handleMiniMixButtonClick}
            >
              MIX!
            </Button>
            <Text>ボタンを押してみましょう！</Text>
          </Flex>

          <Text
            className={pineconeClassNames}
            pos="absolute"
            fz={setRespVal("0.7rem", "0.8rem", "0.8rem")}
            left="36.5%"
            top={pineconeClassNames === "" ? 0 : "110%"}
            ta="center"
            sx={{ zIndex: -1 }}
          >
            \ コンニチワ /
          </Text>
        </Paper>
      )}

      <FixedSizeList
        width="100%"
        height={scrollAreaHeight - STYLING_VALUES.QUEUE_PADDING_TOP}
        itemCount={queue.length}
        itemSize={80} // キューのアイテム1つ分の高さ
      >
        {({ index, style }) => {
          const data = queue[index]
          return (
            <div
              style={{
                ...style,
                paddingLeft: "0.5rem",
                paddingRight: "0.5rem",
                borderTop: index !== 0 ? "solid 1px #ced4da" : "none"
              }}
            >
              <Flex h="100%" align="center" justify="space-between">
                <Flex align="center" gap="sm" sx={{ overflowX: "hidden" }}>
                  <GradientCircle
                    color={data.provider}
                    tooltipLabel={`${PROVIDER_NAME[data.provider]}の楽曲`}
                  />

                  <ListItem
                    image={data.image}
                    title={data.title}
                    caption={` / ${data.artist}`}
                    onArtworkPlayButtonClick={() =>
                      handleArtworkPlayButtonClick(data.id)
                    }
                  />
                </Flex>

                <QueueOperator
                  canMoveToFront={checkCanMoveToFront(index)}
                  canAddToFront={checkCanAddToFront(index, data.playNext)}
                  onMoveToFront={() => onMoveToFront(data.id)}
                  onAddToFront={() => onAddToFront(data.id)}
                />
              </Flex>
            </div>
          )
        }}
      </FixedSizeList>
    </Box>
  )
}

export default memo(Queue)
