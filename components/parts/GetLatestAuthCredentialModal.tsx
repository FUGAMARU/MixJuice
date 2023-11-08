import { Modal, Stack, Group, Button, PasswordInput } from "@mantine/core"
import { AuthCredential, EmailAuthProvider } from "firebase/auth"
import { memo, useCallback, useState, KeyboardEvent, useMemo } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

type Props = {
  isOpen: boolean
  onExecute: (authCredential: AuthCredential) => Promise<void>
  onCancel: () => void
}

const GetLatestAuthCredentialModal = ({
  isOpen,
  onExecute,
  onCancel
}: Props) => {
  const [userInfo] = useAuthState(auth)
  const [isProcessing, setIsProcessing] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const isValidPassword = useMemo(
    () => passwordInput.length >= 6, // 6文字以上なのはFirebaseの仕様
    [passwordInput]
  )

  const handleExecuteButtonClick = useCallback(async () => {
    try {
      setIsProcessing(true)
      if (!isDefined(userInfo) || !isDefined(userInfo.email)) return

      const authCredential = await EmailAuthProvider.credential(
        userInfo.email,
        passwordInput
      )
      if (!isDefined(authCredential)) return

      await onExecute(authCredential)
    } finally {
      setIsProcessing(false)
    }
  }, [passwordInput, userInfo, onExecute])

  const handlePasswordKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing || e.key !== "Enter" || !isValidPassword)
        return
      handleExecuteButtonClick()
    },
    [handleExecuteButtonClick, isValidPassword]
  )

  return (
    <Modal
      size="md"
      opened={isOpen}
      onClose={onCancel}
      title="パスワードを入力してください"
      centered
      styles={{
        title: { color: STYLING_VALUES.TEXT_COLOR_DEFAULT, fontWeight: 700 }
      }}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack mah="30rem" spacing="xl">
        <PasswordInput
          placeholder="パスワード"
          onChange={e => setPasswordInput(e.currentTarget.value)}
          onKeyDown={handlePasswordKeyDown}
        />
        <Group position="right">
          <Button
            onClick={handleExecuteButtonClick}
            loading={isProcessing}
            disabled={!isValidPassword}
          >
            実行
          </Button>
          <Button onClick={onCancel}>キャンセル</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default memo(GetLatestAuthCredentialModal)
