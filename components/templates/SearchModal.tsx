import { Modal, Box, Flex, Input, Stack, Text } from "@mantine/core"
import { memo } from "react"
import ListItem from "../parts/ListItem"
import ProviderHeading from "../parts/ProviderHeading"
import { TEXT_COLOR_DEFAULT } from "@/constants/Styling"
import useBreakPoints from "@/hooks/useBreakPoints"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const SearchModal = ({ isOpen, onClose }: Props) => {
  const { setRespVal } = useBreakPoints()

  return (
    <Modal
      size="lg"
      opened={isOpen}
      onClose={onClose}
      title="🔍 楽曲を検索"
      centered
      styles={{
        title: { color: TEXT_COLOR_DEFAULT, fontWeight: 700 }
      }}
    >
      <Box mah="30rem" sx={{ overflowY: "scroll" }}>
        <Input placeholder="楽曲タイトルを入力…" />

        <Stack mt="sm" spacing="xs">
          <Box>
            <Box mb="xs">
              <ProviderHeading
                providerIconSrc="/spotify-logo.png"
                provider="spotify"
              />
            </Box>

            <Box
              px={setRespVal("xs", "md", "md")}
              py="xs"
              sx={{
                cursor: "pointer",
                borderRadius: "10px",
                transition: "background-color 0.3s ease-out",
                ":hover": { backgroundColor: "#f5f5f5" }
              }}
            >
              <Box sx={{ flex: "1", overflow: "hidden" }}>
                <ListItem
                  imgSrc={undefined}
                  title={"テスト"}
                  subText={"説明"}
                />
              </Box>
            </Box>

            <Box
              px={setRespVal("xs", "md", "md")}
              py="xs"
              sx={{
                cursor: "pointer",
                borderRadius: "10px",
                transition: "background-color 0.3s ease-out",
                ":hover": { backgroundColor: "#f5f5f5" }
              }}
            >
              <Box sx={{ flex: "1", overflow: "hidden" }}>
                <ListItem
                  imgSrc={undefined}
                  title={"テスト2"}
                  subText={"説明2"}
                />
              </Box>
            </Box>
          </Box>

          <Box>
            <Flex mb="xs" align="center" gap="xs">
              <ProviderHeading
                providerIconSrc="/server-icon.png"
                provider="webdav"
              />
              <Text fz="0.8rem" color="#adadad">
                (キャッシュ済み)
              </Text>
            </Flex>

            <Flex
              px={setRespVal("xs", "md", "md")}
              py="xs"
              align="center"
              gap="md"
              sx={{
                cursor: "pointer",
                borderRadius: "10px",
                transition: "background-color 0.3s ease-out",
                ":hover": { backgroundColor: "#f5f5f5" }
              }}
            >
              <Box sx={{ flex: "1", overflow: "hidden" }}>
                <ListItem
                  imgSrc={undefined}
                  title={"テスト"}
                  subText={"説明"}
                />
              </Box>
            </Flex>

            <Box
              px={setRespVal("xs", "md", "md")}
              py="xs"
              sx={{
                cursor: "pointer",
                borderRadius: "10px",
                transition: "background-color 0.3s ease-out",
                ":hover": { backgroundColor: "#f5f5f5" }
              }}
            >
              <Box sx={{ flex: "1", overflow: "hidden" }}>
                <ListItem
                  imgSrc={undefined}
                  title={"テスト2"}
                  subText={"説明2"}
                />
              </Box>
            </Box>
          </Box>

          <Box>
            <Flex mb="xs" align="center" gap="xs">
              <ProviderHeading
                providerIconSrc="/server-icon.png"
                provider="webdav"
              />
              <Text fz="0.8rem" color="#adadad">
                (未キャッシュ)
              </Text>
            </Flex>

            <Flex
              px={setRespVal("xs", "md", "md")}
              py="xs"
              align="center"
              gap="md"
              sx={{
                cursor: "pointer",
                borderRadius: "10px",
                transition: "background-color 0.3s ease-out",
                ":hover": { backgroundColor: "#f5f5f5" }
              }}
            >
              <Box sx={{ flex: "1", overflow: "hidden" }}>
                <ListItem
                  imgSrc={undefined}
                  title={
                    "テストテストテストテストテストテストテストテストテストテストテストテストテストテスト"
                  }
                  subText={
                    "説明説明説明説明説明説明説明説明説明説明説明説明説明説明説明説明説明説明"
                  }
                />
              </Box>
            </Flex>

            <Box
              px={setRespVal("xs", "md", "md")}
              py="xs"
              sx={{
                cursor: "pointer",
                borderRadius: "10px",
                transition: "background-color 0.3s ease-out",
                ":hover": { backgroundColor: "#f5f5f5" }
              }}
            >
              <Box sx={{ flex: "1", overflow: "hidden" }}>
                <ListItem
                  imgSrc={undefined}
                  title={"テスト2"}
                  subText={"説明2"}
                />
              </Box>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Modal>
  )
}

export default memo(SearchModal)
