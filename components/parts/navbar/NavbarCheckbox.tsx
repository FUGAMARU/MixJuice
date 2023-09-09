import { Checkbox } from "@mantine/core"
import { memo } from "react"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useTouchDevice from "@/hooks/useTouchDevice"

type Props = {
  id: string
  label: string
  color: string
  checked: boolean
  onClick: (id: string) => void
}

const NavbarCheckbox = ({ id, label, color, checked, onClick }: Props) => {
  const { isTouchDevice } = useTouchDevice()

  return (
    <Checkbox
      p="0.4rem"
      label={label}
      checked={checked}
      size="md"
      color={color}
      onChange={() => onClick(id)}
      styles={theme => ({
        root: {
          borderRadius: "5px",
          transition: isTouchDevice ? "" : "all .2s ease-in-out",
          "&:hover": !isTouchDevice && {
            backgroundColor: theme.colors[color][0]
          }
        },
        body: {
          cursor: "pointer",
          wordBreak: "break-all"
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
          "&:hover": !isTouchDevice && {
            transform: "translateX(-4px)",
            fontWeight: 700
          }
        }
      })}
    />
  )
}

export default memo(NavbarCheckbox)
