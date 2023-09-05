import { Box, Checkbox } from "@mantine/core"
import { SetStateAction, Dispatch, useCallback, memo } from "react"
import ListItem from "../../parts/ListItem"
import ListItemContainer from "../../parts/ListItemContainer"
import ModalDefault from "../../parts/ModalDefault"
import { ListItemDetail } from "@/types/ListItemDetail"

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  color: string
  items: ListItemDetail[]
  checkedValues: string[]
  dispath: Dispatch<SetStateAction<string[]>>
}

const CheckboxListModal = ({
  isOpen,
  onClose,
  title,
  color,
  items,
  checkedValues,
  dispath
}: Props) => {
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
    <ModalDefault title={title} isOpen={isOpen} onClose={onClose}>
      {items.map(item => (
        <ListItemContainer
          key={item.id}
          flex
          onClick={() => handleItemClick(item.id)}
        >
          <Checkbox
            checked={checkedValues.includes(item.id)}
            value={item.id}
            color={color}
          />

          <Box sx={{ flex: "1", overflow: "hidden" }}>
            <ListItem
              image={item.image}
              title={item.title}
              caption={item.caption}
            />
          </Box>
        </ListItemContainer>
      ))}
    </ModalDefault>
  )
}

export default memo(CheckboxListModal)
