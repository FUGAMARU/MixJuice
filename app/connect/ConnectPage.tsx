"use client"

import { Box, Button, Flex, Text, Title } from "@mantine/core"
import Image from "next/image"
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
        h="30rem"
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
        <Flex w="100%" h="100%" justify="center" align="center">
          <Box>
            <Title size={setRespVal("1.2rem", "1.4rem", "1.4rem")}>
              どのサービスと接続しますか？
            </Title>
            <Text size={setRespVal("0.8rem", "0.9rem", "0.9rem")}>
              MixJuiceと関連サービスを紐づけましょう！
            </Text>

            <Flex w="100%" mt="2rem" justify="space-around">
              <Box>
                <Image
                  src="/spotify-logo.png"
                  width={50}
                  height={50}
                  alt="spotify-logo"
                />
                <Title order={5}>Spotify</Title>
                <Button mt="xs" color="spotify" variant="outline" size="xs">
                  接続する
                </Button>
              </Box>

              <Box>
                <Image
                  src="/server-icon.svg"
                  width={50}
                  height={50}
                  alt="webdav-logo"
                />
                <Title order={5}>WebDav</Title>
                <Button mt="xs" color="grape" variant="outline" size="xs">
                  接続する
                </Button>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Flex>
  )
}

export default ConnectPage
