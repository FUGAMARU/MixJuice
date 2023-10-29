import { Modal, Box } from "@mantine/core"
import { memo } from "react"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { Children } from "@/types/Children"

type Props = {
  title: React.ReactNode
  isOpen: boolean
  onClose: () => void
} & Children

const ModalDefault = ({ title, isOpen, onClose, children }: Props) => {
  return (
    <Modal
      size="lg"
      opened={isOpen}
      onClose={onClose}
      title={title}
      centered
      styles={{
        title: { color: STYLING_VALUES.TEXT_COLOR_DEFAULT, fontWeight: 700 }
      }}
    >
      <Box mah="30rem" sx={{ overflowY: "auto" }}>
        {children}
      </Box>
    </Modal>
  )
}

export default memo(ModalDefault)
