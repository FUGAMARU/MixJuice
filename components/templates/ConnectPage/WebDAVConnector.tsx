import { Box, Flex, Input, Title, useMantineTheme, Button } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { AiFillCheckCircle } from "react-icons/ai"
import { useRecoilState, useRecoilValue } from "recoil"
import { selectedWebDAVFoldersAtom } from "@/atoms/selectedWebDAVFoldersAtom"
import { webDAVSettingStateAtom } from "@/atoms/webDAVSettingStateAtom"
import CircleStep from "@/components/parts/CircleStep"
import ConnectorContainer from "@/components/parts/ConnectorContainer"
import FolderListModal from "@/components/templates/ConnectPage/FolderListModal"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { PROVIDER_ICON_SRC } from "@/constants/ProviderIconSrc"
import useBreakPoints from "@/hooks/useBreakPoints"
import useErrorModal from "@/hooks/useErrorModal"
import useLogger from "@/hooks/useLogger"
import useStorage from "@/hooks/useStorage"
import useWebDAVServer from "@/hooks/useWebDAVServer"
import styles from "@/styles/WebDAVConnector.module.css"
import { WebDAVServerCredentials } from "@/types/WebDAVServerCredentials"
import { isDefined } from "@/utils/isDefined"

type Props = {
  className?: string
  onBack: () => void
}

const WebDAVConnector = ({ className, onBack }: Props) => {
  const showLog = useLogger()
  const theme = useMantineTheme()
  const { breakPoint } = useBreakPoints()
  const { showError } = useErrorModal()
  const settingState = useRecoilValue(webDAVSettingStateAtom)
  const { tryServerConnection } = useWebDAVServer()
  const { userData, updateUserData } = useStorage({ initialize: false })
  const [isConnecting, setIsConnecting] = useState(false)
  const [
    isFolderPathInputModalOpen,
    { open: onFolderPathInputModalOpen, close: onFolderPathInputModalClose }
  ] = useDisclosure(false)
  const [folderPaths, setFolderPaths] = useRecoilState(
    selectedWebDAVFoldersAtom
  )

  const [address, setAddress] = useState("")
  const [user, setUser] = useState("")
  const [password, setPassword] = useState("")

  /** 遷移してきた時にフィールドを復元する */
  useEffect(() => {
    if (!isDefined(userData)) return
    const webdavServerCredentials =
      userData[FIRESTORE_DOCUMENT_KEYS.WEBDAV_SERVER_CREDENTIALS]

    if (!isDefined(webdavServerCredentials)) return

    const parsed = JSON.parse(webdavServerCredentials)
    setAddress(parsed.address)
    setUser(parsed.user)
    setPassword(parsed.password)
  }, [userData])

  /** 認証情報を入力する度に指定したフォルダーのパス情報などの設定を削除する (認証情報が変更され別のサーバーを使うようになった場合、モーダルを開いた時に以前の認証情報で接続していたサーバーのパスが表示されるのはおかしいため) */
  const resetFolderPath = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATHS)
    setFolderPaths([])
  }, [setFolderPaths])

  const isSelectButtonDisabled = useMemo(
    () =>
      address === "" ||
      user === "" ||
      password === "" ||
      !(address.startsWith("https://") || address.startsWith("http://")),
    [address, user, password]
  )

  const handleFolderSelectButtonClick = useCallback(async () => {
    try {
      setIsConnecting(true)
      await tryServerConnection(address, user, password)
      showLog("success", "WebDAVサーバーへの接続に成功しました")
      await updateUserData(
        FIRESTORE_DOCUMENT_KEYS.WEBDAV_SERVER_CREDENTIALS,
        JSON.stringify({
          address,
          user,
          password
        } satisfies WebDAVServerCredentials)
      )
      onFolderPathInputModalOpen()
    } catch (e) {
      showError(e)
    } finally {
      setIsConnecting(false)
    }
  }, [
    address,
    user,
    password,
    tryServerConnection,
    onFolderPathInputModalOpen,
    showError,
    updateUserData,
    showLog
  ])

  return (
    <ConnectorContainer
      className={className}
      title="WebDAVで接続する"
      iconSrc={PROVIDER_ICON_SRC["webdav"]}
      onBack={onBack}
    >
      <Flex align="center" gap="xs">
        <CircleStep step={1} color={theme.colors.webdav[5]} />
        <Title order={4} ta="left" sx={{ flex: 1 }}>
          接続先アドレスを入力する
        </Title>
      </Flex>

      <Box ml="1rem" py="0.2rem" sx={{ borderLeft: "solid 1px #d1d1d1" }}>
        <Input
          className={styles.input}
          type="url"
          pl="2rem"
          placeholder="例: https://example.com:2700"
          sx={{ boxSizing: "border-box" }}
          value={address}
          onChange={e => {
            setAddress(e.target.value)
            resetFolderPath()
          }}
        />
      </Box>

      <Flex align="center" gap="xs">
        <CircleStep step={2} color={theme.colors.webdav[5]} />
        <Title order={4} ta="left" sx={{ flex: 1 }}>
          認証情報を入力する
        </Title>
      </Flex>

      <Flex
        ml="1rem"
        py="0.2rem"
        direction={breakPoint === "SmartPhone" ? "column" : "row"}
        gap="sm"
        justify="space-between"
        sx={{ borderLeft: "solid 1px #d1d1d1" }}
      >
        <Input
          className={styles.input}
          pl="2rem"
          placeholder="ユーザー名"
          sx={{ boxSizing: "border-box" }}
          value={user}
          onChange={e => {
            setUser(e.target.value)
            resetFolderPath()
          }}
        />

        <Input
          className={styles.input}
          pl={breakPoint === "SmartPhone" ? "2rem" : 0}
          type="password"
          placeholder="パスワード"
          sx={{ boxSizing: "border-box" }}
          value={password}
          onChange={e => {
            setPassword(e.target.value)
            resetFolderPath()
          }}
        />
      </Flex>

      <Flex align="center" gap="xs">
        <CircleStep step={3} color={theme.colors.webdav[5]} />
        <Title order={4} ta="left" sx={{ flex: 1 }}>
          MixJuiceで使用するフォルダーを設定する
        </Title>
      </Flex>

      <Flex
        ml="1rem"
        pl="calc(2rem + 1px)" // 左にborderが無いのでその分右にずらす
        py="0.2rem"
        align="center"
        gap="xs"
        ta="left"
      >
        <Button
          className={styles.transition}
          variant="outline"
          loading={isConnecting}
          disabled={isSelectButtonDisabled}
          onClick={handleFolderSelectButtonClick}
        >
          フォルダーを設定
        </Button>

        <AiFillCheckCircle
          size="1.3rem"
          color={theme.colors.webdav[5]}
          style={{ display: settingState === "done" ? "block" : "none" }}
        />
      </Flex>

      <FolderListModal
        isOpen={isFolderPathInputModalOpen}
        folderPaths={folderPaths}
        setFolderPaths={setFolderPaths}
        onClose={onFolderPathInputModalClose}
      />
    </ConnectorContainer>
  )
}

export default memo(WebDAVConnector)
