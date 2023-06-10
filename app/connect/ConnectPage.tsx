"use client"

import { Box, Flex } from "@mantine/core"
import { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { loadingAtom } from "../atoms/loadingAtom"
import useBreakPoints from "../hooks/useBreakPoints"

const ConnectPage = () => {
  const setIsLoading = useSetRecoilState(loadingAtom)
  const { setRespVal } = useBreakPoints()
  useEffect(() => {
    setIsLoading(false)
  }, [setIsLoading])

  return (
    <Flex h="100%" align="center" justify="center">
      <Box
        h="20rem"
        w={setRespVal("85%", "30rem", "30rem")}
        p="md"
        bg="white"
        ta="center"
        sx={{
          border: "solid",
          borderWidth: "1px",
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderRadius: "5px"
        }}
      >
        どのサービスと接続しますか？
      </Box>
    </Flex>
  )
}

export default ConnectPage
