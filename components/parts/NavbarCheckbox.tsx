import { Checkbox } from "@mantine/core"
import useTouchDevice from "@/hooks/useTouchDevice"

interface Props {
  id: string
  label: string
  color: string
  checked: boolean
  // eslint-disable-next-line unused-imports/no-unused-vars
  onClick: (id: string) => void
}

const NavbarCheckbox: React.FC<Props> = ({
  id,
  label,
  color,
  checked,
  onClick
}) => {
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
          zIndex: 2
        },
        labelWrapper: {
          width: "100%",
          position: "relative",
          zIndex: 1
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
