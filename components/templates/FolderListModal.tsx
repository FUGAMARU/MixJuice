import { Modal, Flex, Input, Button, Stack, Text } from "@mantine/core"
import Image from "next/image"
import {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useState
} from "react"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { TEXT_COLOR_DEFAULT } from "@/constants/Styling"
import useBreakPoints from "@/hooks/useBreakPoints"
import useWebDAVApi from "@/hooks/useWebDAVApi"

type Props = {
  isOpen: boolean
  folderPaths: string[]
  setFolderPaths: Dispatch<SetStateAction<string[]>>
  onClose: () => void
}

const FolderListModal = ({
  isOpen,
  folderPaths,
  setFolderPaths,
  onClose
}: Props) => {
  const { breakPoint } = useBreakPoints()
  const [inputFolderPath, setInputFolderPath] = useState("")
  const [isCheckingFolderExists, setIsCheckingFolderExists] = useState(false)
  const [isFolderNotExists, setIsFolderNotExists] = useState(false)
  const { checkIsFolderExists } = useWebDAVApi({ initialize: false })

  /** モーダルが開かれる時に以前追加したフォルダーの項目を復元する */
  useEffect(() => {
    const folderPath = localStorage.getItem(
      LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS
    )
    if (folderPath !== null) setFolderPaths(JSON.parse(folderPath))
  }, [setFolderPaths])

  const handleAddFolderPathButtonClick = useCallback(async () => {
    if (inputFolderPath === undefined) return

    try {
      const folderPathWithoutSlash = inputFolderPath.replace(/\/$/, "") // inputFolderPathの末尾にスラッシュが入っていたら取り除く
      setIsCheckingFolderExists(true)
      await checkIsFolderExists(folderPathWithoutSlash)
      setIsFolderNotExists(false)

      const newFolderPaths = [...folderPaths, folderPathWithoutSlash]

      localStorage.setItem(
        LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS,
        JSON.stringify(newFolderPaths)
      )
      setFolderPaths(newFolderPaths)
    } catch (e) {
      setIsFolderNotExists(true)
    } finally {
      setIsCheckingFolderExists(false)
    }
  }, [folderPaths, inputFolderPath, setFolderPaths, checkIsFolderExists])

  const removeFolderPath = useCallback(
    (folderPath: string) => {
      const removedFolderPaths = folderPaths.filter(path => path !== folderPath)

      localStorage.setItem(
        LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS,
        JSON.stringify(removedFolderPaths)
      )
      setFolderPaths(removedFolderPaths)
    },
    [setFolderPaths, folderPaths]
  )

  return (
    <Modal
      size="lg"
      opened={isOpen}
      onClose={onClose}
      title="MixJuiceで使用するフォルダーを追加"
      centered
      styles={{
        title: { color: TEXT_COLOR_DEFAULT, fontWeight: 700 }
      }}
    >
      <Flex gap="md" align="center" justify="space-between">
        <Input.Wrapper
          w="100%"
          error={
            isFolderNotExists && "指定されたパスのフォルダーが存在しません"
          }
        >
          <Input
            placeholder="例: /home/user/music"
            value={inputFolderPath}
            onChange={e => setInputFolderPath(e.target.value)}
          />
        </Input.Wrapper>

        <Button
          color="webdav"
          loading={isCheckingFolderExists}
          disabled={!inputFolderPath || !inputFolderPath.startsWith("/")}
          onClick={handleAddFolderPathButtonClick}
        >
          追加
        </Button>
      </Flex>

      <Stack spacing="xs" py="md">
        {folderPaths.map(folderPath => (
          <Flex
            key={folderPath}
            pl={breakPoint === "SmartPhone" ? 0 : "md"}
            align="center"
            justify="space-between"
          >
            <Flex gap="xs" align="center" sx={{ overflowX: "hidden" }}>
              <Image
                src="/folder-icon.png"
                width={25}
                height={25}
                alt="Folder Icon"
              />
              <Text
                fw={700}
                sx={{ overflowX: "hidden", textOverflow: "ellipsis" }}
              >
                {folderPath}
              </Text>
            </Flex>
            <Button
              color="red"
              variant="subtle"
              onClick={() => removeFolderPath(folderPath)}
            >
              削除
            </Button>
          </Flex>
        ))}
      </Stack>
    </Modal>
  )
}

export default memo(FolderListModal)
