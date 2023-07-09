import { Box, Button, Modal } from "@mantine/core"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useRecoilState } from "recoil"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { SpotifyAuthError } from "@/classes/SpotifyAuthError"

const ErrorModal = () => {
  const router = useRouter()
  const [errorModalInstance, setErrorModalInstance] = useRecoilState(
    errorModalInstanceAtom
  )

  const handleModalClose = useCallback(
    (idx: number) => {
      setErrorModalInstance(prev => {
        const newItems = [...prev]
        newItems.splice(idx, 1)
        return newItems
      })

      if (errorModalInstance[idx] instanceof SpotifyAuthError) {
        /** ここに処理が来る段階で既にSpotifyの認証情報は削除済み */
        router.replace("/connect")
      }
    },
    [errorModalInstance, setErrorModalInstance, router]
  )

  return errorModalInstance.map((error, idx) => (
    <Modal
      key={`ErrorModal-${idx}`}
      centered
      opened
      title="エラー"
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      onClose={() => handleModalClose(idx)}
      styles={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.2)"
        },
        header: {
          backgroundColor: "#ff6459",
          color: "white"
        },
        title: {
          fontWeight: 700
        },
        body: {
          backgroundColor: "#ff6459",
          color: "white"
        }
      }}
    >
      {error instanceof Error || error instanceof SpotifyAuthError
        ? error.message
        : ""}

      <Box mt="md" ta="right">
        <Button
          sx={{
            backgroundColor: "white",
            color: "#ff6459",
            ":hover": {
              backgroundColor: "white"
            }
          }}
          onClick={() => handleModalClose(idx)}
        >
          OK
        </Button>
      </Box>
    </Modal>
  ))
}

export default ErrorModal
