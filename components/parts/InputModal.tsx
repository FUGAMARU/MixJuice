import {
  Modal,
  Stack,
  Group,
  Button,
  PasswordInput,
  Input
} from "@mantine/core"
import { memo, useCallback, useState, KeyboardEvent, useMemo } from "react"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { isValidEmail, isValidPassword } from "@/utils/validation"

type Props = {
  isOpen: boolean
  type: "email" | "password"
  title: string
  confirmButtonText: string
  onConfirm: (inputValue: string) => Promise<void> | void
  onCancel: () => void
}

const InputModal = ({
  isOpen,
  type,
  title,
  confirmButtonText,
  onConfirm,
  onCancel
}: Props) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const isConfirmButtonDisabled = useMemo(() => {
    switch (type) {
      case "email":
        return !isValidEmail(inputValue)
      case "password":
        return !isValidPassword(inputValue)
    }
  }, [inputValue, type])

  const handleConfirmButtonClick = useCallback(async () => {
    try {
      setIsProcessing(true)
      await onConfirm(inputValue)
    } finally {
      setIsProcessing(false)
    }
  }, [inputValue, onConfirm])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (
        e.nativeEvent.isComposing ||
        e.key !== "Enter" ||
        isConfirmButtonDisabled
      )
        return
      handleConfirmButtonClick()
    },
    [handleConfirmButtonClick, isConfirmButtonDisabled]
  )

  return (
    <Modal
      size="md"
      opened={isOpen}
      onClose={onCancel}
      title={title}
      centered
      styles={{
        title: { color: STYLING_VALUES.TEXT_COLOR_DEFAULT, fontWeight: 700 }
      }}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack mah="30rem" spacing="xl">
        {type === "email" ? (
          <Input
            type="email"
            placeholder="メールアドレス"
            onChange={e => setInputValue(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <PasswordInput
            placeholder="パスワード"
            onChange={e => setInputValue(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        )}

        <Group position="right">
          <Button
            onClick={handleConfirmButtonClick}
            loading={isProcessing}
            disabled={isConfirmButtonDisabled}
          >
            {confirmButtonText}
          </Button>
          <Button onClick={onCancel}>キャンセル</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default memo(InputModal)
