import { Button, MantineSize } from "@mantine/core"
import { MouseEventHandler, memo } from "react"
import useTouchDevice from "@/hooks/useTouchDevice"
import { greycliffCF, notoSansJP } from "@/styles/fonts"
import { Children } from "@/types/Children"

type Props = {
  size: MantineSize
  ff: "notoSansJP" | "greycliffCF"
  fz: string
  fw: number
  letterSpacing?: string | undefined
  disabled?: boolean | undefined
  loading?: boolean | undefined
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined
} & Children

const GradientButton = ({
  size,
  ff,
  fz,
  fw,
  disabled,
  loading,
  letterSpacing,
  onClick,
  children
}: Props) => {
  const isTouchDevice = useTouchDevice()

  return (
    <Button
      size={size}
      ff={
        ff === "greycliffCF"
          ? greycliffCF.style.fontFamily
          : notoSansJP.style.fontFamily
      }
      fz={fz}
      fw={fw}
      variant="gradient"
      gradient={{ from: "#2afadf", to: "#4c83ff" }}
      sx={{
        transition: "all .2s ease-in-out",
        "&:hover": {
          transform: isTouchDevice ? "" : "scale(1.02)"
        }
      }}
      styles={{
        label: {
          letterSpacing
        }
      }}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export default memo(GradientButton)
