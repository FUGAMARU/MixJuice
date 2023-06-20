"use client"

import { Box, Text } from "@mantine/core"
import { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { loadingAtom } from "../../atoms/loadingAtom"
import MusicList from "@/app/main/templates/MusicList"
import Player from "@/app/main/templates/Player"
import useBreakPoints from "@/hooks/useBreakPoints"

const MainPage = () => {
  const { breakPoint, setRespVal } = useBreakPoints()
  const setIsLoading = useSetRecoilState(loadingAtom)

  useEffect(() => {
    setIsLoading(false)
  }, [setIsLoading])

  return (
    <>
      <Box w="100%" h={setRespVal("15vh", "25vh", "25vh")}>
        <Player />
      </Box>

      <Box w="100%" pt="md">
        <MusicList />
      </Box>

      <Box p="md">
        <Box>メインコンテンツ</Box>
        <Text>フォントチェック</Text>
        <Text>Font Check</Text>
        <Text>Alphabetと日本語のミックス</Text>
        {breakPoint}
      </Box>
    </>
  )
}

export default MainPage
