import { Flex } from "@mantine/core"
import { memo } from "react"

type Props = {
  className?: string
}

const WebDAVConnector = ({ className }: Props) => {
  return (
    <Flex
      className={className}
      w="100%"
      h="100%"
      align="center"
      bg="grape"
      sx={{
        animationTimingFunction: "ease-out"
      }}
    >
      WebDAVの設定をしよう
    </Flex>
  )
}

export default memo(WebDAVConnector)
