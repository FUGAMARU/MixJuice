import { Checkbox, Modal, ScrollArea, Stack } from "@mantine/core"
import { ChangeEvent, SetStateAction, Dispatch } from "react"
import { TEXT_COLOR_DEFAULT } from "@/constants/Styling"

type Props = {
  opened: boolean
  onClose: () => void
  title: string
  color: string
  dispath: Dispatch<SetStateAction<string[]>>
}

const CheckboxListModal = ({
  opened,
  onClose,
  title,
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

  const playlists = Array.from(
    { length: 30 },
    (_, index) => `playlist${index + 1}`
  )

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
          <Checkbox
            label="プレイリスト1"
            value="playlist01"
            color={color}
            onChange={handleCheckboxChange}
            styles={{ label: { color: TEXT_COLOR_DEFAULT } }}
          />
          <Checkbox
            label="プレイリスト2"
            value="playlist02"
            color={color}
            onChange={handleCheckboxChange}
            styles={{ label: { color: TEXT_COLOR_DEFAULT } }}
          />
          <Checkbox
            label="すごい長いプレイリスト名すごい長いプレイリスト名すごい長いプレイリスト名すごい長いプレイリスト名すごい長いプレイリスト名すごい長いプレイリスト名"
            value="playlist03"
            color={color}
            onChange={handleCheckboxChange}
            styles={{ label: { color: TEXT_COLOR_DEFAULT } }}
          />
          <Checkbox
            label="プレイリスト4"
            value="playlist04"
            color={color}
            onChange={handleCheckboxChange}
            styles={{ label: { color: TEXT_COLOR_DEFAULT } }}
          />
          {playlists.map(playlist => (
            <Checkbox
              key={playlist}
              label={playlist}
              value={playlist}
              color={color}
              onChange={handleCheckboxChange}
              styles={{ label: { color: TEXT_COLOR_DEFAULT } }}
            />
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Modal>
  )
}

export default CheckboxListModal
