import { Flex, Stack, Title, Text, Center } from "@mantine/core"
import Image from "next/image"
import { memo } from "react"
import { IoIosArrowBack } from "react-icons/io"

type Props = {
  className?: string
  title: string
  iconSrc: string
  children: React.ReactNode
  onBack: () => void
}

const ConnectorContainer = ({
  className,
  title,
  iconSrc,
  children,
  onBack
}: Props) => {
  return (
    <Flex
      className={className}
      w="100%"
      h="100%"
      align="center"
      sx={{
        animationTimingFunction: "ease-out"
      }}
    >
      <Stack w="100%" spacing="xs">
        <Flex
          w="fit-content"
          mx="auto"
          mb="lg"
          px="lg"
          pb="sm"
          justify="center"
          align="center"
          gap="0.3rem"
          sx={{ borderBottom: "solid 1px #d1d1d1" }}
        >
          <Image src={iconSrc} width={25} height={25} alt="spotify-logo" />
          <Title order={4}>{title}</Title>
        </Flex>

        {children}

        <Center pt="lg" sx={{ cursor: "pointer" }} onClick={onBack}>
          <IoIosArrowBack color="#228be6" />
          <Text size="0.8rem" color="blue">
            接続先選択画面に戻る
          </Text>
        </Center>
      </Stack>
    </Flex>
  )
}

export default memo(ConnectorContainer)
