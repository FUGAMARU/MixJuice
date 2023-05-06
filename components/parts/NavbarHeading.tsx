import { Flex, Space, Title } from "@mantine/core"
import Image from "next/image"
import { BiCheckboxChecked, BiCheckboxMinus } from "react-icons/bi"

type Props = {
  icon: string
  provider: string
  // eslint-disable-next-line unused-imports/no-unused-vars
  onClick: (provider: string, to: boolean) => void
}

const NavbarHeading: React.FC<Props> = ({ icon, provider, onClick }) => {
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
          color="#424242"
          size="1.5rem"
          style={{ cursor: "pointer" }}
          onClick={() => onClick(provider, true)}
        />
        <BiCheckboxMinus
          color="#424242"
          size="1.5rem"
          style={{ cursor: "pointer" }}
          onClick={() => onClick(provider, false)}
        />
      </Flex>
    </Flex>
  )
}

export default NavbarHeading
