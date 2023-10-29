import { Flex, Input, Button, Stack, Text } from "@mantine/core"
import Image from "next/image"
import {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react"
import ModalDefault from "../../parts/ModalDefault"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import useBreakPoints from "@/hooks/useBreakPoints"
import useWebDAVServer from "@/hooks/useWebDAVServer"

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
  const { checkIsFolderExists } = useWebDAVServer()

  /** モーダルが開かれる時に以前追加したフォルダーの項目を復元する */
  useEffect(() => {
    const folderPath = localStorage.getItem(
      LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS
    )
    if (folderPath !== null) setFolderPaths(JSON.parse(folderPath))
  }, [setFolderPaths])

  const handleAddFolderPathButtonClick = useCallback(async () => {
    if (inputFolderPath === undefined) return

    setIsCheckingFolderExists(true)
    const folderPathWithoutSlash = inputFolderPath.replace(/\/$/, "") // inputFolderPathの末尾にスラッシュが入っていたら取り除く

    const isExists = await checkIsFolderExists(folderPathWithoutSlash)
    if (!isExists) {
      setIsFolderNotExists(true)
      setIsCheckingFolderExists(false)
      return
    }

    setIsFolderNotExists(false)
    setIsCheckingFolderExists(false)

    const newFolderPaths = [...folderPaths, folderPathWithoutSlash]

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS,
      JSON.stringify(newFolderPaths)
    )
    setFolderPaths(newFolderPaths)
    setInputFolderPath("")
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

  const isAddButtonDisabled = useMemo(
    () => !inputFolderPath || !inputFolderPath.startsWith("/"),
    [inputFolderPath]
  )

  const handlePathInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing || e.key !== "Enter" || isAddButtonDisabled)
        return
      handleAddFolderPathButtonClick()
    },
    [handleAddFolderPathButtonClick, isAddButtonDisabled]
  )

  return (
    <ModalDefault
      title="MixJuiceで使用するフォルダーを追加"
      isOpen={isOpen}
      onClose={onClose}
    >
      <Flex gap="md" align="start" justify="space-between" data-autoFocus>
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
            onKeyDown={handlePathInputKeyDown}
          />
        </Input.Wrapper>

        <Button
          color="webdav"
          loading={isCheckingFolderExists}
          disabled={isAddButtonDisabled}
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
    </ModalDefault>
  )
}

export default memo(FolderListModal)
