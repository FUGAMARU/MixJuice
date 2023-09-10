import { Flex, Space, Title } from "@mantine/core"
import Image from "next/image"
import { memo } from "react"
import { BiCheckboxChecked, BiCheckboxMinus } from "react-icons/bi"
import { PROVIDER_NAME } from "@/constants/ProviderName"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { Provider } from "@/types/Provider"

type Props = {
  providerIconSrc: string
  provider: Provider
  customText?: string | undefined
  onClick?: (provider: Provider, to: boolean) => void
}

const ProviderHeading = ({
  providerIconSrc,
  provider,
  customText,
  onClick
}: Props) => {
  return (
    <Flex align="center" justify="space-between">
      <Flex align="end">
        <Image
          src={providerIconSrc}
          height={28}
          width={28}
          alt="Provider's logo"
        />
        <Space w="xs" />
        <Title order={3} sx={{ cursor: "default" }} ff="GreycliffCF">
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
