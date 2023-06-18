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

  // スライドによる画面遷移
  const handleSlide = useCallback(
    async (
      direction: "go" | "back",
      classNameDispatcher: Dispatch<SetStateAction<string>>,
      displayDispatcher: Dispatch<SetStateAction<boolean>>
    ) => {
      switch (direction) {
        case "go":
          setProviderSelectorClassName(
            "animate__animated animate__fadeOutLeft animate__fast"
          )
          await new Promise(resolve => setTimeout(resolve, 600))
          setIsDisplayProviderSelector(false)

          classNameDispatcher(
            "animate__animated animate__slideInRight animate__fast"
          )
          displayDispatcher(true)
          break
        case "back":
          classNameDispatcher(
            "animate__animated animate__fadeOutRight animate__fast"
          )
          await new Promise(resolve => setTimeout(resolve, 600))
          displayDispatcher(false)

          setProviderSelectorClassName(
            "animate__animated animate__slideInLeft animate__fast"
          )
          setIsDisplayProviderSelector(true)
          break
      }
    },
    []
  )

  return (
    <Flex h="100%" align="center" justify="center">
      <Box
        h="30rem"
        w={setRespVal("85%", "30rem", "30rem")}
        px="xl"
        py="md"
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
            handleSlide(
              "go",
              setSpotifyConnectorClassName,
              setIsDisplaySpotifyConnector
            )
          }
          onShowWebDAVConnector={() =>
            handleSlide(
              "go",
              setWebDAVConnectorClassName,
              setIsDisplayWebDAVConnector
            )
          }
        />

        {isDisplaySpotifyConnector && (
          <SpotifyConnector
            className={spotifyConnectorClassName}
            onBack={() =>
              handleSlide(
                "back",
                setSpotifyConnectorClassName,
                setIsDisplaySpotifyConnector
              )
            }
          />
        )}

        {isDisplayWebDAVConnector && (
          <WebDAVConnector className={webDAVConnectorClassName} />
        )}
      </Box>
    </Flex>
  )
}

export default ConnectPage
