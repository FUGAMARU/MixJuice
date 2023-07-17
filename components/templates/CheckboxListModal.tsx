import { Modal, Box, Flex, Checkbox } from "@mantine/core"
import { SetStateAction, Dispatch, useCallback, memo } from "react"
import ListItem from "../parts/ListItem"
import { TEXT_COLOR_DEFAULT } from "@/constants/Styling"
import useBreakPoints from "@/hooks/useBreakPoints"
import { CheckboxListModalItem } from "@/types/CheckboxListModalItem"

type Props = {
  opened: boolean
  onClose: () => void
  title: string
  color: string
  items: CheckboxListModalItem[]
  checkedValues: string[]
  dispath: Dispatch<SetStateAction<string[]>>
}

const CheckboxListModal = ({
  opened,
  onClose,
  title,
  color,
  items,
  checkedValues,
  dispath
}: Props) => {
  const { setRespVal } = useBreakPoints()

  const handleItemClick = useCallback(
    (id: string) => {
      if (checkedValues.includes(id)) {
        dispath(prevValues => prevValues.filter(v => v !== id))
        return
      }
      dispath(prevValues => [...prevValues, id])
    },
    [checkedValues, dispath]
  )

  return (
    <Modal
      size="lg"
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      styles={{
        title: { color: TEXT_COLOR_DEFAULT, fontWeight: 700 }
      }}
    >
      <Box mah="30rem" sx={{ overflowY: "scroll" }}>
        {items.map(item => (
          <Flex
            key={item.id}
            px={setRespVal("xs", "md", "md")}
            py="xs"
            align="center"
            gap="md"
            sx={{
              cursor: "pointer",
              borderRadius: "10px",
              transition: "background-color 0.3s ease-out",
              ":hover": { backgroundColor: "#f5f5f5" }
            }}
            onClick={() => handleItemClick(item.id)}
          >
            <Checkbox
              checked={checkedValues.includes(item.id)}
              value={item.id}
              color={color}
            />

            <Box sx={{ flex: "1", overflow: "hidden" }}>
              <ListItem
                imgSrc={item.imgSrc}
                title={item.name}
                subText={item.description}
              />
            </Box>
          </Flex>
        ))}
      </Box>
    </Modal>
  )
}

export default memo(CheckboxListModal)
