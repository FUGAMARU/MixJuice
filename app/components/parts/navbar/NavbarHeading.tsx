import { Flex, Space, Title } from "@mantine/core"
import Image from "next/image"
import { BiCheckboxChecked, BiCheckboxMinus } from "react-icons/bi"
import { TEXT_COLOR_DEFAULT } from "@/constants/Styling"

type Props = {
  icon: string
  provider: string
  // eslint-disable-next-line unused-imports/no-unused-vars
  onClick: (provider: string, to: boolean) => void
}

const NavbarHeading = ({ icon, provider, onClick }: Props) => {
  return (
    <Flex align="center" justify="space-between">
      <Flex align="end">
        <Image src={icon} height={28} width={28} alt="logo" />
        <Space w="xs" />
        <Title order={3} sx={{ cursor: "default" }} ff="GreycliffCF">
          {provider}
        </Title>
      </Flex>

      <Flex pr="md" align="center">
        <BiCheckboxChecked
          color={TEXT_COLOR_DEFAULT}
          size="1.5rem"
          style={{ cursor: "pointer" }}
          onClick={() => onClick(provider, true)}
        />
        <BiCheckboxMinus
          color={TEXT_COLOR_DEFAULT}
          size="1.5rem"
          style={{ cursor: "pointer" }}
          onClick={() => onClick(provider, false)}
        />
      </Flex>
    </Flex>
  )
}

export default NavbarHeading
