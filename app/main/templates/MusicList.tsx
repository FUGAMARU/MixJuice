import { Box, Divider } from "@mantine/core"
import { useViewportSize } from "@mantine/hooks"
import { useMemo } from "react"
import { useRecoilValue } from "recoil"
import MusicDetail from "../../components/parts/MusicDetail"
import { playerHeightAtom } from "@/atoms/playerHeightAtom"
import { HEADER_HEIGHT } from "@/constants/ElementSize"

const MusicList = () => {
  const sampleData = [
    {
      artworkSrc:
        "https://m.media-amazon.com/images/I/61Le0bt44kL._AC_SL1000_.jpg",
      title: "輪! Moon! dass! cry!",
      artist: "田中望（赤崎千夏），菊池茜（戸松遥），鷺宮しおり（豊崎愛生）"
    },
    {
      artworkSrc:
        "https://www.lyrical-nonsense.com/wp-content/uploads/2022/04/cadode-Kaika.jpg",
      title: "回夏",
      artist: "cadode"
    },
    {
      artworkSrc:
        "https://m.media-amazon.com/images/I/81gTjaNgZEL._AC_SL1500_.jpg",
      title: "リカバーデコレーション",
      artist: "小野寺小咲(花澤香菜)"
    },
    {
      artworkSrc:
        "https://is1-ssl.mzstatic.com/image/thumb/Music18/v4/dd/de/6a/ddde6a36-7f0e-1c9b-6f0e-4d24b8333d33/ZMCZ-10786.jpg/1200x1200bf-60.jpg",
      title: "Now Loading!!!!",
      artist: "fourfolium"
    },
    {
      artworkSrc:
        "https://m.media-amazon.com/images/I/A1uD-BjXWHL._AC_SL1500_.jpg",
      title:
        "すっごく長いタイトルの曲すっごく長いタイトルの曲すっごく長いタイトルの曲すっごく長いタイトルの曲すっごく長いタイトルの曲すっごく長いタイトルの曲",
      artist:
        "すっごく長いアーティスト名すっごく長いアーティスト名すっごく長いアーティスト名すっごく長いアーティスト名すっごく長いアーティスト名"
    },
    {
      artworkSrc:
        "https://m.media-amazon.com/images/I/61Le0bt44kL._AC_SL1000_.jpg",
      title: "輪! Moon! dass! cry!",
      artist: "田中望（赤崎千夏），菊池茜（戸松遥），鷺宮しおり（豊崎愛生）"
    },
    {
      artworkSrc:
        "https://www.lyrical-nonsense.com/wp-content/uploads/2022/04/cadode-Kaika.jpg",
      title: "回夏",
      artist: "cadode"
    },
    {
      artworkSrc:
        "https://m.media-amazon.com/images/I/81gTjaNgZEL._AC_SL1500_.jpg",
      title: "リカバーデコレーション",
      artist: "小野寺小咲(花澤香菜)"
    },
    {
      artworkSrc:
        "https://is1-ssl.mzstatic.com/image/thumb/Music18/v4/dd/de/6a/ddde6a36-7f0e-1c9b-6f0e-4d24b8333d33/ZMCZ-10786.jpg/1200x1200bf-60.jpg",
      title: "Now Loading!!!!",
      artist: "fourfolium"
    },
    {
      artworkSrc:
        "https://m.media-amazon.com/images/I/A1uD-BjXWHL._AC_SL1500_.jpg",
      title:
        "すっごく長いタイトルの曲すっごく長いタイトルの曲すっごく長いタイトルの曲すっごく長いタイトルの曲すっごく長いタイトルの曲すっごく長いタイトルの曲",
      artist:
        "すっごく長いアーティスト名すっごく長いアーティスト名すっごく長いアーティスト名すっごく長いアーティスト名すっごく長いアーティスト名"
    }
  ]

  const { height: viewportHeight } = useViewportSize()
  const playerHeight = useRecoilValue(playerHeightAtom)
  const scrollAreaHeight = useMemo(
    () => viewportHeight - HEADER_HEIGHT - playerHeight,
    [viewportHeight, playerHeight]
  )

  return (
    <Box h={scrollAreaHeight} px="sm" py="md" sx={{ overflowY: "auto" }}>
      {sampleData.map((data, idx) => {
        return (
          <Box key={idx}>
            {idx !== 0 && <Divider my="xs" />}

            <MusicDetail
              idx={idx + 1}
              artworkSrc={data.artworkSrc}
              title={data.title}
              artist={data.artist}
            />
          </Box>
        )
      })}
    </Box>
  )
}

export default MusicList
