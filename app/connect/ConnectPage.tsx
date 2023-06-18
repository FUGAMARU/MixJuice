"use client"

import { Box, Flex } from "@mantine/core"
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from "react"
import { useSetRecoilState } from "recoil"
import { loadingAtom } from "../atoms/loadingAtom"
import useBreakPoints from "../hooks/useBreakPoints"
import ProviderSelector from "./views/ProviderSelector"
import SpotifyConnector from "./views/SpotifyConnector"
import WebDAVConnector from "./views/WebDAVConnector"

const ConnectPage = () => {
  const { setRespVal } = useBreakPoints()

  const setIsLoading = useSetRecoilState(loadingAtom)
  useEffect(() => {
    setIsLoading(false)
  }, [setIsLoading])

  const [isDisplayProviderSelector, setIsDisplayProviderSelector] =
    useState(true)
  const [isDisplaySpotifyConnector, setIsDisplaySpotifyConnector] =
    useState(false)
  const [isDisplayWebDAVConnector, setIsDisplayWebDAVConnector] =
    useState(false)

  const [providerSelectorClassName, setProviderSelectorClassName] = useState("")
  const [spotifyConnectorClassName, setSpotifyConnectorClassName] = useState("")
  const [webDAVConnectorClassName, setWebDAVConnectorClassName] = useState("")

  // 接続先選択画面から各種サービス接続画面への遷移
  const handleShowConnector = useCallback(
    async (
      classNameDispatcher: Dispatch<SetStateAction<string>>,
      displayDispatcher: Dispatch<SetStateAction<boolean>>
    ) => {
      setProviderSelectorClassName(
        "animate__animated animate__slideOutLeft animate__fast"
      )
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsDisplayProviderSelector(false)

      classNameDispatcher(
        "animate__animated animate__slideInRight animate__fast"
      )
      displayDispatcher(true)
    },
    []
  )

  return (
    <Flex h="100%" align="center" justify="center">
      <Box
        h="30rem"
        w={setRespVal("85%", "30rem", "30rem")}
        p="md"
        bg="white"
        ta="center"
        sx={{
          border: "solid 1px rgba(0, 0, 0, 0.1)",
          borderRadius: "5px",
          overflow: "hidden"
        }}
      >
        <ProviderSelector
          className={providerSelectorClassName}
          isDisplay={isDisplayProviderSelector}
          onShowSpotifyConnector={() =>
            handleShowConnector(
              setSpotifyConnectorClassName,
              setIsDisplaySpotifyConnector
            )
          }
          onShowWebDAVConnector={() =>
            handleShowConnector(
              setWebDAVConnectorClassName,
              setIsDisplayWebDAVConnector
            )
          }
        />

        <SpotifyConnector
          className={spotifyConnectorClassName}
          isDisplay={isDisplaySpotifyConnector}
        />

        <WebDAVConnector
          className={webDAVConnectorClassName}
          isDisplay={isDisplayWebDAVConnector}
        />
      </Box>
    </Flex>
  )
}

export default ConnectPage
