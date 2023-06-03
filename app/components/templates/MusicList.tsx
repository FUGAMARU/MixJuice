import { Box, Divider, Stack } from "@mantine/core"
import MusicDetail from "../parts/MusicDetail"

const MusicList: React.FC = () => {
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
    }
  ]

  return (
    <Stack px="sm" spacing={0}>
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
    </Stack>
  )
}

export default MusicList
