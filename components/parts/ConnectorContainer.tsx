import { Flex, Stack, Title, Center } from "@mantine/core"
import Image from "next/image"
import { memo } from "react"
import ArrowTextButton from "./ArrowTextButton"
import { Children } from "@/types/Children"

type Props = {
  className?: string
  title: string
  iconSrc: string
  onBack: () => void
} & Children

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
          <Image
            src={iconSrc}
            width={25}
            height={25}
            alt="Service Provider's logo"
          />
          <Title order={4}>{title}</Title>
        </Flex>

        {children}

        <Center mt="lg">
          <ArrowTextButton direction="left" onClick={onBack}>
            接続先選択画面に戻る
          </ArrowTextButton>
        </Center>
      </Stack>
    </Flex>
  )
}

export default memo(ConnectorContainer)
