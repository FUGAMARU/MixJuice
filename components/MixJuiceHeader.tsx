import { Center, Header } from "@mantine/core"
import Image from "next/image"

const MixJuiceHeader: React.FC = () => {
  return (
    <Header
      height={50}
      zIndex={999}
      sx={theme => ({ boxShadow: theme.shadows.sm })}
    >
      <Center h="100%">
        <Image
          src="/mix-juice-tmp-logo.png"
          width={152}
          height={40}
          alt="service logo"
        />
      </Center>
    </Header>
  )
}

export default MixJuiceHeader
