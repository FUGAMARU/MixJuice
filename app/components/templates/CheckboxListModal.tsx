import { Modal, Stack, Box, Flex, Checkbox } from "@mantine/core"
import { ChangeEvent, SetStateAction, Dispatch, useCallback } from "react"
import ListItem from "../parts/ListItem"
import { TEXT_COLOR_DEFAULT } from "@/constants/Styling"
import useBreakPoints from "@/hooks/useBreakPoints"
import { CheckboxListModalItem } from "@/types/CheckboxListModalItem"

type Props = {
  opened: boolean
  onClose: () => void
  title: string
  items: CheckboxListModalItem[]
  color: string
  dispath: Dispatch<SetStateAction<string[]>>
}

const CheckboxListModal = ({
  opened,
  onClose,
  title,
  items,
  color,
  dispath
}: Props) => {
  const { setRespVal } = useBreakPoints()

  const handleCheckboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value, checked } = event.target
      if (checked) {
        dispath(prevValues => [...prevValues, value])
        return
      }
      dispath(prevValues => prevValues.filter(v => v !== value))
    },
    [dispath]
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
        <Stack px={setRespVal("xs", "md", "md")}>
          {items.map(item => (
            <Flex key={item.id} align="center" gap="md">
              <Checkbox
                value={item.id}
                color={color}
                onChange={handleCheckboxChange}
              />

              <Box sx={{ flex: "1", overflow: "hidden" }}>
                <ListItem
                  noIndex
                  imgSrc={item.imgSrc}
                  title={item.name}
                  subText={item.description}
                />
              </Box>
            </Flex>
          ))}
        </Stack>
      </Box>
    </Modal>
  )
}

export default CheckboxListModal
