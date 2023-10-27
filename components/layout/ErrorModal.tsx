import { Box, Button, Flex, Modal, Text } from "@mantine/core"
import { useRouter } from "next/navigation"
import { memo, useCallback, useEffect, useState } from "react"
import { BiErrorAlt } from "react-icons/bi"
import { IoWarningOutline } from "react-icons/io5"
import { useRecoilState } from "recoil"
import { errorModalConfigAtom } from "@/atoms/errorModalConfigAtom"
import { SpotifyAuthError } from "@/classes/SpotifyAuthError"
import { PAGE_PATH } from "@/constants/PagePath"
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
    if (lastConfig.instance instanceof SpotifyAuthError) {
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
          (lastConfig.instance instanceof Error ||
            lastConfig.instance instanceof SpotifyAuthError)
        ) {
          return config.instance.message !== lastConfig.instance.message
        }
        return false
      })
    )
  }, [setErrorModalConfigs, lastConfig, router])

  return (
    modalStack.length > 0 && (
      <Modal
        centered
        opened
        title={
          <Flex align="center" gap="xs">
            {lastConfig.level === "error" ? (
              <BiErrorAlt size="1.2rem" />
            ) : (
              <IoWarningOutline size="1.2rem" />
            )}
            <Text color="white">
              {lastConfig.level === "error" ? "エラー" : "注意"}
            </Text>
          </Flex>
        }
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        onClose={handleModalClose}
        styles={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.2)"
          },
          header: {
            backgroundColor:
              lastConfig.level === "error" ? "#ff6459" : "#fd9353",
            color: "white"
          },
          title: {
            fontWeight: 700
          },
          body: {
            backgroundColor:
              lastConfig.level === "error" ? "#ff6459" : "#fd9353",
            color: "white"
          }
        }}
      >
        {(lastConfig.instance instanceof Error ||
          lastConfig.instance instanceof SpotifyAuthError) &&
          lastConfig.instance.message}
        <Box mt="md" ta="right">
          <Button
            sx={{
              backgroundColor: "white",
              color: lastConfig.level === "error" ? "#ff6459" : "#fd9353",
              ":hover": {
                backgroundColor: "white"
              }
            }}
            onClick={handleModalClose}
          >
            OK
          </Button>
        </Box>
      </Modal>
    )
  )
}

export default memo(ErrorModal)
