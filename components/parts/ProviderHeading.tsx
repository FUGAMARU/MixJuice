import { Flex, Space, Title } from "@mantine/core"
import Image from "next/image"
import { memo } from "react"
import { BiCheckboxChecked, BiCheckboxMinus } from "react-icons/bi"
import { PROVIDER_ICON_SRC } from "@/constants/ProviderIconSrc"
import { PROVIDER_NAME } from "@/constants/ProviderName"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { greycliffCF } from "@/styles/fonts"
import { Provider } from "@/types/Provider"

type Props = {
  provider: Provider
  customText?: string | undefined
  onClick?: (provider: Provider, to: boolean) => void
}

const ProviderHeading = ({ provider, customText, onClick }: Props) => {
  return (
    <Flex align="center" justify="space-between">
      <Flex align="end">
        <Image
          src={PROVIDER_ICON_SRC[provider]}
          height={28}
          width={28}
          alt="Provider's logo"
        />
        <Space w="xs" />
        <Title
          ff={greycliffCF.style.fontFamily}
          fw={700}
          order={3}
          sx={{ cursor: "default" }}
        >
          {customText || PROVIDER_NAME[provider]}
        </Title>
      </Flex>

      {onClick && (
        <Flex pr="md" align="center">
          <BiCheckboxChecked
            color={STYLING_VALUES.TEXT_COLOR_DEFAULT}
            size="1.5rem"
            style={{ cursor: "pointer" }}
            onClick={() => onClick && onClick(provider, true)}
          />
          <BiCheckboxMinus
            color={STYLING_VALUES.TEXT_COLOR_DEFAULT}
            size="1.5rem"
            style={{ cursor: "pointer" }}
            onClick={() => onClick && onClick(provider, false)}
          />
        </Flex>
      )}
    </Flex>
  )
}

export default memo(ProviderHeading)
