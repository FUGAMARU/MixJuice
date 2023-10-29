import { Box, Button, Center, Flex, Space, Text } from "@mantine/core"
import { useRouter } from "next/navigation"
import { memo, useCallback, useEffect, useState } from "react"
import { BiErrorAlt } from "react-icons/bi"
import { IoWarningOutline } from "react-icons/io5"
import { useRecoilState } from "recoil"
import { errorModalConfigAtom } from "@/atoms/errorModalConfigAtom"
import { SpotifyAuthError } from "@/classes/SpotifyAuthError"
import { PAGE_PATH } from "@/constants/PagePath"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import { ErrorModalConfig } from "@/types/ErrorModalConfig"

const ErrorModal = () => {
  const router = useRouter()
  const [errorModalConfigs, setErrorModalConfigs] =
    useRecoilState(errorModalConfigAtom)
  const [modalStack, setModalStack] = useState<ErrorModalConfig[]>([])
  const lastConfig = modalStack[modalStack.length - 1]

  useEffect(() => {
    const spotifyAuthErrors = errorModalConfigs.filter(
      item =>
        (item.instance instanceof Error ||
          item.instance instanceof SpotifyAuthError) &&
        item.instance.name === "SpotifyAuthError"
    )

    const nonSpotifyAuthErrors = errorModalConfigs.filter(
      item =>
        (item.instance instanceof Error ||
          item.instance instanceof SpotifyAuthError) &&
        item.instance.name !== "SpotifyAuthError"
    )

    setModalStack([...nonSpotifyAuthErrors, ...spotifyAuthErrors])
  }, [errorModalConfigs])

  const handleModalClose = useCallback(() => {
    if (lastConfig?.instance instanceof SpotifyAuthError) {
      /** ここに処理が来る段階で既にSpotifyの認証情報は削除済み */
      router.replace(`${PAGE_PATH.CONNECT_PAGE}?provider=spotify`)
      setErrorModalConfigs([])
      return
    }

    setErrorModalConfigs(prevConfigs =>
      prevConfigs.filter(config => {
        if (
          (config.instance instanceof Error ||
            config.instance instanceof SpotifyAuthError) &&
          (lastConfig?.instance instanceof Error ||
            lastConfig?.instance instanceof SpotifyAuthError)
        ) {
          return config.instance.message !== lastConfig?.instance.message
        }
        return false
      })
    )
  }, [setErrorModalConfigs, lastConfig, router])

  const [isDisplayContainer, setIsDisplayContainer] = useState(false)
  const [isDisplayModal, setIsDisplayModal] = useState(false)
  useEffect(() => {
    if (modalStack.length > 0) {
      setIsDisplayContainer(true)
      setIsDisplayModal(true)
      return
    }
    setIsDisplayModal(false)
  }, [modalStack])

  const handleAnimationEnd = useCallback(() => {
    if (!isDisplayModal) setIsDisplayContainer(false)
  }, [isDisplayModal])

  return (
    <Center
      w="100%"
      h="100%"
      pos="fixed"
      top={0}
      left={0}
      sx={{ display: isDisplayContainer ? "flex" : "none" }}
      onAnimationEnd={handleAnimationEnd}
    >
      {modalStack.map((config, idx) => (
        <Center
          key={`modal-${idx}`}
          className={
            isDisplayModal
              ? "animate__animated animate__zoomIn"
              : "animate__animated animate__zoomOut"
          }
          w="100%"
          h="100%"
          pos="fixed"
          top={0}
          left={0}
          sx={{
            zIndex: ZINDEX_NUMBERS.MODAL,
            ["--animate-duration"]: "0.2s"
          }}
        >
          <Flex
            w="25rem"
            p="md"
            bg={config.level === "error" ? "#ff6459" : "#fd9353"}
            direction="column"
            justify="space-between"
            sx={{
              borderRadius: "10px"
            }}
          >
            <Box>
              <Flex align="center" gap="xs">
                {config.level === "error" ? (
                  <BiErrorAlt size="1.2rem" color="white" />
                ) : (
                  <IoWarningOutline size="1.2rem" color="white" />
                )}
                <Text color="white" fw={700} lh={1}>
                  {config.level === "error" ? "エラー" : "注意"}
                </Text>
              </Flex>

              <Space h="xs" />

              <Text color="white">
                {(config.instance instanceof Error ||
                  config.instance instanceof SpotifyAuthError) &&
                  config.instance.message}
              </Text>
            </Box>

            <Box mt="md" ta="right">
              <Button
                sx={{
                  backgroundColor: "white",
                  color: config.level === "error" ? "#ff6459" : "#fd9353",
                  ":hover": {
                    backgroundColor: "white"
                  }
                }}
                onClick={handleModalClose}
              >
                OK
              </Button>
            </Box>
          </Flex>
        </Center>
      ))}

      <Box
        className={
          isDisplayModal
            ? "animate__animated animate__fadeIn"
            : "animate__animated animate__fadeOut"
        }
        w="100%"
        h="100%"
        pos="fixed"
        top={0}
        left={0}
        bg="rgba(0, 0, 0, 0.2)"
        sx={{
          zIndex: ZINDEX_NUMBERS.MODAL_OVERLAY,
          ["--animate-duration"]: "0.2s"
        }}
      />
    </Center>
  )
}

export default memo(ErrorModal)
