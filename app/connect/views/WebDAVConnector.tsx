import { Flex } from "@mantine/core"

type Props = {
  className?: string
  isDisplay?: boolean
}

const WebDAVConnector: React.FC<Props> = ({ className, isDisplay = true }) => {
  return (
    <Flex
      className={className}
      w="100%"
      h="100%"
      justify="center"
      align="center"
      bg="grape"
      sx={{
        display: isDisplay ? "flex" : "none",
        animationTimingFunction: "ease-out"
      }}
    >
      WebDAVの設定をしよう
    </Flex>
  )
}

export default WebDAVConnector
