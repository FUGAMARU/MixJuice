import { Checkbox } from "@mantine/core"
import useTouchDevice from "@/hooks/useTouchDevice"

interface Props {
  label: string
  color: string
}

const NavbarCheckbox: React.FC<Props> = ({ label, color }) => {
  const { isTouchDevice } = useTouchDevice()

  return (
    <Checkbox
      label={label}
      size="md"
      color={color}
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
          transition: isTouchDevice ? "" : "all .2s ease-in-out",
          "&:hover": isTouchDevice
            ? undefined
            : {
                transform: "translateX(-4px)",
                backgroundColor: theme.colors[color][0],
                borderRadius: "10px"
              }
        }
      })}
    />
  )
}

export default NavbarCheckbox
