import { Modal, Box } from "@mantine/core"
import { memo } from "react"
import { STYLING_VALUES } from "@/constants/StylingValues"

type Props = {
  title: React.ReactNode
  isOpen: boolean
  onClose: () => void
  height?: string | number | undefined
  withoutCloseButton?: boolean
  children: React.ReactNode
}

const ModalDefault = ({
  title,
  isOpen,
  onClose,
  height,
  withoutCloseButton,
  children
}: Props) => {
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
      withCloseButton={!withoutCloseButton}
    >
      <Box
        h={height}
        mah={height ? undefined : "30rem"}
        sx={{ overflowY: "scroll" }}
      >
        {children}
      </Box>
    </Modal>
  )
}

export default memo(ModalDefault)
