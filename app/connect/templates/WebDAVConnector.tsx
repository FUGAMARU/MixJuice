import { Box, Flex, Input, Title, useMantineTheme, Button } from "@mantine/core"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { AiFillCheckCircle } from "react-icons/ai"
import { useSetRecoilState } from "recoil"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import CircleStep from "@/components/parts/CircleStep"
import ConnectorContainer from "@/components/parts/ConnectorContainer"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import useBreakPoints from "@/hooks/useBreakPoints"
import useWebDAV from "@/hooks/useWebDAV"
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
  const { connect } = useWebDAV()
  const [isConnecting, setIsConnecting] = useState(false)

  const [address, setAddress] = useState("")
  const [user, setUser] = useState("")
  const [password, setPassword] = useState("")

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

  /** フィールドを変更する度に入力値をlocalStorageに保存する */
  useEffect(() => {
    if (address === "") return
    localStorage.setItem(LOCAL_STORAGE_KEYS.WEBDAV_ADDRESS, address)
  }, [address])
  useEffect(() => {
    if (user === "") return
    localStorage.setItem(LOCAL_STORAGE_KEYS.WEBDAV_USER, user)
  }, [user])
  useEffect(() => {
    if (password === "") return
    localStorage.setItem(LOCAL_STORAGE_KEYS.WEBDAV_PASSWORD, password)
  }, [password])

  const isSelectButtonDisabled = useMemo(
    () =>
      address === "" ||
      user === "" ||
      password === "" ||
      !(address.startsWith("https://") || address.startsWith("http://")),
    [address, user, password]
  )

  const handleFolderSelectButtonClick = useCallback(async () => {
    setIsConnecting(true)
    try {
      await connect(address, user, password)
      console.log("🟩DEBUG: WebDAVサーバーへの接続に成功しました")
    } catch (e) {
      setErrorModalInstance(prev => [...prev, e])
    } finally {
      setIsConnecting(false)
    }
  }, [connect, setErrorModalInstance, address, user, password])

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
          className={styles.clientId}
          type="url"
          pl="2rem"
          placeholder="例: https://example.com:2700"
          sx={{ boxSizing: "border-box" }}
          value={address}
          onChange={e => setAddress(e.target.value)}
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
          className={styles.clientId}
          pl="2rem"
          placeholder="ユーザー名"
          sx={{ boxSizing: "border-box" }}
          value={user}
          onChange={e => setUser(e.target.value)}
        />

        <Input
          className={styles.clientId}
          pl={breakPoint === "SmartPhone" ? "2rem" : 0}
          type="password"
          placeholder="パスワード"
          sx={{ boxSizing: "border-box" }}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </Flex>

      <Flex align="center" gap="xs">
        <CircleStep step={3} color={theme.colors.webdav[5]} />
        <Title order={4} ta="left" sx={{ flex: 1 }}>
          MixJuiceで使用するフォルダーを選択する
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
          フォルダーを選択
        </Button>

        <AiFillCheckCircle
          size="1.3rem"
          color="#2ad666"
          style={{ display: settingState === "done" ? "block" : "none" }}
        />
      </Flex>
    </ConnectorContainer>
  )
}

export default memo(WebDAVConnector)
