import {
  Box,
  Flex,
  Input,
  Title,
  useMantineTheme,
  Button,
  Modal
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { AiFillCheckCircle } from "react-icons/ai"
import { useRecoilState, useSetRecoilState } from "recoil"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { selectedWebDAVFolderAtom } from "@/atoms/selectedWebDAVFolderAtom"
import { webDAVAuthenticatedAtom } from "@/atoms/webDAVAuthenticatedAtom"
import CircleStep from "@/components/parts/CircleStep"
import ConnectorContainer from "@/components/parts/ConnectorContainer"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { TEXT_COLOR_DEFAULT } from "@/constants/Styling"
import useBreakPoints from "@/hooks/useBreakPoints"
import useWebDAVApi from "@/hooks/useWebDAVApi"
import useWebDAVSettingState from "@/hooks/useWebDAVSettingState"
import styles from "@/styles/WebDAVConnector.module.css"

type Props = {
  className?: string
  onBack: () => void
}

const WebDAVConnector = ({ className, onBack }: Props) => {
  const theme = useMantineTheme()
  const { breakPoint } = useBreakPoints()
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const { settingState } = useWebDAVSettingState()
  const { checkAuth, checkIsFolderExists } = useWebDAVApi({ initialize: false })
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCheckingFolderExists, setIsCheckingFolderExists] = useState(false)
  const [
    isFolderPathInputModalOpen,
    { open: onFolderPathInputModalOpen, close: onFolderPathInputModalClose }
  ] = useDisclosure(false)
  const [isFolderNotExists, setIsFolderNotExists] = useState(false)
  const setIsAuthenticated = useSetRecoilState(webDAVAuthenticatedAtom)

  const [address, setAddress] = useState("")
  const [user, setUser] = useState("")
  const [password, setPassword] = useState("")
  const [folderPath, setFolderPath] = useRecoilState(selectedWebDAVFolderAtom)

  /** 遷移してきた時にフィールドを復元する */
  useEffect(() => {
    const address = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_ADDRESS)
    if (address !== null) setAddress(address)
  }, [])
  useEffect(() => {
    const user = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_USER)
    if (user !== null) setUser(user)
  }, [])
  useEffect(() => {
    const password = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_PASSWORD)
    if (password !== null) setPassword(password)
  }, [])
  useEffect(() => {
    const folderPath = localStorage.getItem(
      LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATH
    )
    if (folderPath !== null) setFolderPath(folderPath)
  }, [setFolderPath])

  /** 認証情報を入力する度に指定したフォルダーのパス情報などの設定を削除する (認証情報が変更され別のサーバーを使うようになった場合、モーダルを開いた時に以前の認証情報で接続していたサーバーのパスが表示されるのはおかしいため) */
  const resetFolderPath = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATH)
    setFolderPath(undefined)
  }, [setFolderPath])

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
      await checkAuth(address, user, password)
      console.log("🟩DEBUG: WebDAVサーバーへの接続に成功しました")
      setIsAuthenticated(true)
      localStorage.setItem(LOCAL_STORAGE_KEYS.WEBDAV_ADDRESS, address)
      localStorage.setItem(LOCAL_STORAGE_KEYS.WEBDAV_USER, user)
      localStorage.setItem(LOCAL_STORAGE_KEYS.WEBDAV_PASSWORD, password)
      onFolderPathInputModalOpen()
    } catch (e) {
      setIsAuthenticated(false)
      setErrorModalInstance(prev => [...prev, e])
    } finally {
      setIsConnecting(false)
    }
  }, [
    address,
    user,
    password,
    checkAuth,
    onFolderPathInputModalOpen,
    setErrorModalInstance,
    setIsAuthenticated
  ])

  const handleFolderPathInputSubmitButtonClick = useCallback(async () => {
    if (folderPath === undefined) return

    try {
      const folderPathWithoutSlash = folderPath.replace(/\/$/, "") // folderPathの末尾にスラッシュが入っていたら取り除く
      setIsCheckingFolderExists(true)
      await checkIsFolderExists(folderPathWithoutSlash)
      setIsFolderNotExists(false)
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.WEBDAV_FOLDER_PATH,
        folderPathWithoutSlash
      )
      setFolderPath(folderPathWithoutSlash)
      onFolderPathInputModalClose()
    } catch (e) {
      setIsFolderNotExists(true)
    } finally {
      setIsCheckingFolderExists(false)
    }
  }, [
    checkIsFolderExists,
    onFolderPathInputModalClose,
    folderPath,
    setFolderPath
  ])

  return (
    <ConnectorContainer
      className={className}
      title="WebDAVで接続する"
      iconSrc="/server-icon.png"
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

      <Modal
        size="lg"
        opened={isFolderPathInputModalOpen}
        onClose={onFolderPathInputModalClose}
        title="フォルダーパスを入力してください"
        centered
        styles={{
          title: { color: TEXT_COLOR_DEFAULT, fontWeight: 700 }
        }}
      >
        <Input.Wrapper
          error={
            isFolderNotExists && "指定されたパスのフォルダーが存在しません"
          }
        >
          <Input
            placeholder="例: /home/user/music"
            value={folderPath}
            onChange={e => setFolderPath(e.target.value)}
          />
        </Input.Wrapper>
        <Box mt="sm" ta="right">
          <Button
            color="webdav"
            loading={isCheckingFolderExists}
            disabled={!folderPath || !folderPath.startsWith("/")}
            onClick={handleFolderPathInputSubmitButtonClick}
          >
            OK
          </Button>
        </Box>
      </Modal>
    </ConnectorContainer>
  )
}

export default memo(WebDAVConnector)
