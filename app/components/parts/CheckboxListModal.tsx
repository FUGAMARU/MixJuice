import { Checkbox, Modal, ScrollArea, Stack } from "@mantine/core"
import { ChangeEvent, SetStateAction, Dispatch } from "react"
import { TEXT_COLOR_DEFAULT } from "@/constants/Styling"
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
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target
    if (checked) {
      dispath(prevValues => [...prevValues, value])
      return
    }
    dispath(prevValues => prevValues.filter(v => v !== value))
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      styles={{
        title: { color: TEXT_COLOR_DEFAULT, fontWeight: 700 }
      }}
    >
      <ScrollArea.Autosize mah="30rem" pb="md">
        <Stack>
          {items.map(item => (
            <Checkbox
              key={item.id}
              label={item.name}
              value={item.id}
              color={color}
              onChange={handleCheckboxChange}
            />
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Modal>
  )
}

export default CheckboxListModal
