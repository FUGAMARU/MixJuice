"use client"

import { Box, Center } from "@mantine/core"
import { useSearchParams } from "next/navigation"
import {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useState
} from "react"
import { useSetRecoilState } from "recoil"
import ProviderSelector from "../../components/templates/ConnectPage/ProviderSelector"
import SpotifyConnector from "../../components/templates/ConnectPage/SpotifyConnector"
import WebDAVConnector from "../../components/templates/ConnectPage/WebDAVConnector"
import { loadingAtom } from "@/atoms/loadingAtom"
import useBreakPoints from "@/hooks/useBreakPoints"

const ConnectPage = () => {
  const params = useSearchParams()
  const provider = params.get("provider")

  const { setRespVal } = useBreakPoints()

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

  const setIsLoading = useSetRecoilState(loadingAtom)
  useEffect(() => {
    ;(async () => {
      setIsLoading(false)

      if (!provider) return

      await new Promise(resolve => setTimeout(resolve, 2500))

      switch (provider) {
        case "spotify":
          handleSlide(
            "go",
            setSpotifyConnectorClassName,
            setIsDisplaySpotifyConnector
          )
          break
        case "webdav":
          handleSlide(
            "go",
            setWebDAVConnectorClassName,
            setIsDisplayWebDAVConnector
          )
          break
      }
    })()
  }, [setIsLoading, provider, handleSlide])

  return (
    <Center h="100%">
      <Box
        h={setRespVal("33rem", "30rem", "30rem")}
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
          <WebDAVConnector
            className={webDAVConnectorClassName}
            onBack={() =>
              handleSlide(
                "back",
                setWebDAVConnectorClassName,
                setIsDisplayWebDAVConnector
              )
            }
          />
        )}
      </Box>
    </Center>
  )
}

export default memo(ConnectPage)
