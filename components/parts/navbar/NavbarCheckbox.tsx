import { Box, Checkbox } from "@mantine/core"
import { MouseEvent, memo, useCallback } from "react"
import TooltipDefault from "../TooltipDefault"
import { ZINDEX_NUMBERS } from "@/constants/ZIndexNumbers"
import useTouchDevice from "@/hooks/useTouchDevice"

type Props = {
  id: string
  label: string
  color: string
  checked: boolean
  onClick: (id: string) => void
  onLabelClick: () => void
}

const NavbarCheckbox = ({
  id,
  label,
  color,
  checked,
  onClick,
  onLabelClick
}: Props) => {
  const { isTouchDevice } = useTouchDevice()

  const handleLabelClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onLabelClick()
    },
    [onLabelClick]
  )

  return (
    <Checkbox
      p="0.4rem"
      label={
        <TooltipDefault floating label={`${label}の楽曲一覧を見る`}>
          <Box onClick={handleLabelClick}>{label}</Box>
        </TooltipDefault>
      }
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
          },
          lineHeight: 1.4
        }
      })}
    />
  )
}

export default memo(NavbarCheckbox)
