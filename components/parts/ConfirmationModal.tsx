import { Button, Group, Modal, Stack } from "@mantine/core"
import { memo, useCallback, useState } from "react"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { Children } from "@/types/Children"

type Props = {
  isOpen: boolean
  confirmButtonText: string
  cancelButtonText: string
  onConfirm: () => void
  onCancel: () => void
  withLoadingAnimation?: boolean | undefined
} & Children

const ConfirmationModal = ({
  isOpen,
  children,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  withLoadingAnimation = false
}: Props) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirmButtonClick = useCallback(async () => {
    try {
      if (withLoadingAnimation) setIsProcessing(true)
      await onConfirm()
    } finally {
      setIsProcessing(false)
    }
  }, [onConfirm, withLoadingAnimation])

  return (
    <Modal
      size="md"
      opened={isOpen}
      onClose={onCancel}
      title="確認"
      centered
      styles={{
        title: { color: STYLING_VALUES.TEXT_COLOR_DEFAULT, fontWeight: 700 }
      }}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack mah="30rem" spacing="xl">
        {children}
        <Group position="right">
          <Button onClick={handleConfirmButtonClick} loading={isProcessing}>
            {confirmButtonText}
          </Button>
          <Button onClick={onCancel}>{cancelButtonText}</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default memo(ConfirmationModal)
