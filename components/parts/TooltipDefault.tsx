import { Tooltip } from "@mantine/core"
import { memo } from "react"
import { Children } from "@/types/Children"

type Props = {
  label: string
  floating?: boolean
  withArrow?: boolean
} & Children

const TooltipDefault = ({ label, floating, withArrow, children }: Props) => {
  return floating ? (
    <Tooltip.Floating label={label}>{children}</Tooltip.Floating>
  ) : (
    <Tooltip
      label={label}
      withArrow={withArrow}
      transitionProps={{
        transition: "fade",
        duration: 300
      }}
    >
      {children}
    </Tooltip>
  )
}

export default memo(TooltipDefault)
