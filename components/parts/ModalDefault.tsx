import { Modal, Box } from "@mantine/core"
import { memo } from "react"
import { TEXT_COLOR_DEFAULT } from "@/constants/Styling"

type Props = {
  title: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const ModalDefault = ({ title, isOpen, onClose, children }: Props) => {
  return (
    <Modal
      size="lg"
      opened={isOpen}
      onClose={onClose}
      title={title}
      centered
      styles={{
        title: { color: TEXT_COLOR_DEFAULT, fontWeight: 700 }
      }}
    >
      <Box mah="30rem" sx={{ overflowY: "scroll" }}>
        {children}
      </Box>
    </Modal>
  )
}

export default memo(ModalDefault)