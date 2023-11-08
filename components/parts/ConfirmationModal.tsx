import { Button, Group, Modal, Stack } from "@mantine/core"
import { memo } from "react"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { Children } from "@/types/Children"

type Props = {
  isOpen: boolean
  title: string
  confirmButtonText: string
  cancelButtonText: string
  onConfirm: () => void
  onCancel: () => void
} & Children

const ConfirmationModal = ({
  isOpen,
  title,
  children,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel
}: Props) => {
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
        {children}
        <Group position="right">
          <Button onClick={onConfirm}>{confirmButtonText}</Button>
          <Button onClick={onCancel}>{cancelButtonText}</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default memo(ConfirmationModal)
