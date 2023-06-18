import { Flex } from "@mantine/core"

type Props = {
  className?: string
  isDisplay?: boolean
}

const SpotifyConnector: React.FC<Props> = ({ className, isDisplay = true }) => {
  return (
    <Flex
      className={className}
      w="100%"
      h="100%"
      justify="center"
      align="center"
      bg="green"
      sx={{
        display: isDisplay ? "flex" : "none",
        animationTimingFunction: "ease-out"
      }}
    >
      Spotifyの設定をしよう
    </Flex>
  )
}

export default SpotifyConnector
