import { Box, Checkbox } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { MouseEvent, memo, useCallback, useMemo } from "react"
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
  const { hovered, ref } = useHover()
  const transition = useMemo(
    () => (isTouchDevice ? "" : "all .2s ease-in-out"),
    [isTouchDevice]
  )

  const handleLabelClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onLabelClick()
    },
    [onLabelClick]
  )

  return (
    <Box sx={{ cursor: "pointer" }} onClick={handleLabelClick} ref={ref}>
      <Checkbox
        p="0.4rem"
        label={
          <TooltipDefault floating label={`${label}の楽曲一覧を見る`}>
            <Box>{label}</Box>
          </TooltipDefault>
        }
        checked={checked}
        size="md"
        color={color}
        onChange={() => onClick(id)}
        styles={theme => ({
          root: {
            borderRadius: "5px",
            transition,
            backgroundColor:
              hovered && !isTouchDevice ? theme.colors[color][0] : ""
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
            transition,
            fontWeight: !isTouchDevice && hovered ? 700 : 500,
            transform: !isTouchDevice && hovered ? "translateX(-4px)" : "",
            lineHeight: 1.4
          }
        })}
      />
    </Box>
  )
}

export default memo(NavbarCheckbox)
