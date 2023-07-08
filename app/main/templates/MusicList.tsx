import { Box, Divider } from "@mantine/core"
import { useViewportSize } from "@mantine/hooks"
import { useMemo } from "react"
import { useRecoilValue } from "recoil"
import ListItem from "../../components/parts/ListItem"
import { musicListAtom } from "@/atoms/musicListAtom"
import { playerHeightAtom } from "@/atoms/playerHeightAtom"
import { HEADER_HEIGHT } from "@/constants/Styling"
import useBreakPoints from "@/hooks/useBreakPoints"

const MusicList = () => {
  const { setRespVal } = useBreakPoints()
  const { height: viewportHeight } = useViewportSize()
  const playerHeight = useRecoilValue(playerHeightAtom)
  const scrollAreaHeight = useMemo(
    () => viewportHeight - HEADER_HEIGHT - playerHeight,
    [viewportHeight, playerHeight]
  )
  const musicList = useRecoilValue(musicListAtom)

  return (
    <Box
      h={scrollAreaHeight}
      px={setRespVal("0.4rem", "0.5rem", "2rem")}
      py="md"
      sx={{ overflowY: "auto" }}
    >
      {musicList.map((data, idx) => {
        return (
          <Box key={idx}>
            {idx !== 0 && <Divider my="xs" />}

            <ListItem
              idx={idx + 1}
              imgSrc={data.imgSrc}
              title={data.title}
              subText={` / ${data.artist}`}
            />
          </Box>
        )
      })}
    </Box>
  )
}

export default MusicList
