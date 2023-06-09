import { Checkbox } from "@mantine/core"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useTouchDevice from "@/hooks/useTouchDevice"

type Props = {
  id: string
  label: string
  color: string
  checked: boolean
  // eslint-disable-next-line unused-imports/no-unused-vars
  onClick: (id: string) => void
}

const NavbarCheckbox = ({ id, label, color, checked, onClick }: Props) => {
  const { isTouchDevice } = useTouchDevice()

  return (
    <Checkbox
      label={label}
      checked={checked}
      size="md"
      color={color}
      onChange={() => onClick(id)}
      styles={theme => ({
        body: {
          cursor: "pointer"
        },
        inner: {
          position: "relative",
          zIndex: ZINDEX_NUMBERS.NAVBAR_CHECKBOX_INNER
        },
        labelWrapper: {
          width: "100%",
          position: "relative",
          zIndex: ZINDEX_NUMBERS.NAVBAR_CHECKBOX_LABEL_WRAPPER
        },
        input: {
          cursor: "pointer"
        },
        label: {
          cursor: "pointer",
          fontWeight: 500,
          transition: isTouchDevice ? "" : "all .2s ease-in-out",
          "&:hover": isTouchDevice
            ? undefined
            : {
                transform: "translateX(-4px)",
                backgroundColor: theme.colors[color][0],
                borderRadius: "5px"
              }
        }
      })}
    />
  )
}

export default NavbarCheckbox
