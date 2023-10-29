import { Flex, Center, Group, PasswordInput, Text, Input } from "@mantine/core"
import { memo, useMemo } from "react"
import { STYLING_VALUES } from "@/constants/StylingValues"

type Props = {
  type: string
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

const LabeledInput = ({
  type,
  icon,
  label,
  placeholder,
  value,
  onChange,
  onKeyDown
}: Props) => {
  const commonProps = useMemo(
    () => ({
      w: "100%",
      size: "xs",
      placeholder,
      sx: { flex: 1 },
      styles: {
        input: {
          borderTopLeftRadius: "0px",
          borderBottomLeftRadius: "0px",
          borderTopRightRadius: "5px",
          borderBottomRightRadius: "5px",
          borderWidth: "1px",
          borderLeftWidth: "0px",
          height: "auto" // 指定しないとテキストが若干下にずれる
        }
      },
      value,
      onChange,
      onKeyDown
    }),
    [value, onChange, placeholder, onKeyDown]
  )

  return (
    <Flex>
      <Center
        px="0.5rem"
        bg={STYLING_VALUES.TEXT_COLOR_DEFAULT}
        sx={{
          borderTopLeftRadius: "5px",
          borderBottomLeftRadius: "5px",
          border: "solid 1px gray",
          color: "white"
        }}
      >
        <Group spacing="0.2rem">
          {icon}
          <Text fz="0.8rem" fw={700} color="white">
            {label}
          </Text>
        </Group>
      </Center>
      {type === "password" ? (
        <PasswordInput {...commonProps} />
      ) : (
        <Input type={type} {...commonProps} />
      )}
    </Flex>
  )
}

export default memo(LabeledInput)
