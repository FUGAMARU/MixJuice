import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Select,
  Stack,
  Switch,
  Text
} from "@mantine/core"
import { useDisclosure, useLocalStorage } from "@mantine/hooks"
import { FirebaseError } from "firebase/app"
import {
  AuthCredential,
  deleteUser,
  reauthenticateWithCredential
} from "firebase/auth"
import { memo, useCallback, useMemo, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { IoSettingsOutline } from "react-icons/io5"
import { PiUserCircleThin } from "react-icons/pi"
import ConfirmationModal from "@/components/parts/ConfirmationModal"
import GetLatestAuthCredentialModal from "@/components/parts/GetLatestAuthCredentialModal"
import ModalDefault from "@/components/parts/ModalDefault"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { PAGE_PATH } from "@/constants/PagePath"
import { DEFAULT_SETTING_VALUES, SETTING_ITEMS } from "@/constants/Settings"
import useAuth from "@/hooks/useAuth"
import useBreakPoints from "@/hooks/useBreakPoints"
import useStorage from "@/hooks/useStorage"
import useTransit from "@/hooks/useTransit"
import { SettingValues } from "@/types/DefaultSettings"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const SettingModal = ({ isOpen, onClose }: Props) => {
  const { breakPoint, setRespVal } = useBreakPoints()
  const [userInfo] = useAuthState(auth)
  const { signOut } = useAuth()
  const { deleteUserData } = useStorage({ initialize: false })
  const { onTransit } = useTransit()
  const [settings, setSettings] = useLocalStorage<SettingValues>({
    key: LOCAL_STORAGE_KEYS.SETTINGS,
    defaultValue: DEFAULT_SETTING_VALUES
  })
  const [
    isConfirmationDeleteUserModalOpen,
    {
      open: onOpenConfirmationDeleteUserModal,
      close: onCloseConfirmationDeleteUserModal
    }
  ] = useDisclosure(false)
  const [
    isGetLatestAuthCredentialModalOpen,
    {
      open: onOpenGetLatestAuthCredentialModal,
      close: onCloseGetLatestAuthCredentialModal
    }
  ] = useDisclosure(false)

  const [isProcessingSignout, setIsProcessingSignout] = useState(false)
  const handleSignoutButtonClick = useCallback(async () => {
    setIsProcessingSignout(true)
    await signOut()
    onClose()
    await onTransit(PAGE_PATH.MAIN_PAGE, PAGE_PATH.SIGNIN_PAGE)
  }, [signOut, onClose, onTransit])

  const executeDeleteUser = useCallback(
    async (latestUserCredential: AuthCredential) => {
      try {
        if (!isDefined(userInfo)) return

        const newUserCredential = await reauthenticateWithCredential(
          userInfo,
          latestUserCredential
        )
        if (!isDefined(newUserCredential.user.email)) return

        await deleteUser(newUserCredential.user)
        await deleteUserData(newUserCredential.user.email)
        await onTransit(PAGE_PATH.MAIN_PAGE, PAGE_PATH.SIGNIN_PAGE)
      } catch (e) {
        if (e instanceof FirebaseError) {
          switch (
            e.code // TODO: エラーコード対応拡充？？ (https://firebase.google.com/docs/reference/js/v8/firebase.FirebaseError#code)
          ) {
            case "auth/invalid-login-credentials":
              alert(
                "サインインに失敗しました。パスワードが間違っている可能性があります。"
              ) // TODO: showErrorを使うとz-indexを指定しても最前面に表示されないので暫定対応
              break
            default:
              console.log("🟥ERROR: ", e)
              alert("何らかの原因でサインインに失敗しました") // TODO: showErrorを使うとz-indexを指定しても最前面に表示されないので暫定対応
          }
        }
      }
    },
    [userInfo, deleteUserData, onTransit]
  )

  const handleConfirmPassword = useCallback(
    async (nextAction: "deleteUser" | "changePassword" | "changeEmail") => {
      switch (nextAction) {
        case "deleteUser":
          onCloseConfirmationDeleteUserModal()
          onOpenGetLatestAuthCredentialModal()
          break
        case "changePassword":
          // TODO: パスワード変更処理
          break
        case "changeEmail":
          // TODO: メールアドレス変更処理
          break
      }
    },
    [onOpenGetLatestAuthCredentialModal, onCloseConfirmationDeleteUserModal]
  )

  const handleCancelGetLatestAuthCredentialModal = useCallback(
    async (action: "deleteUser" | "changePassword" | "changeEmail") => {
      switch (action) {
        case "deleteUser":
          onCloseGetLatestAuthCredentialModal()
          onOpenConfirmationDeleteUserModal()
          break
        case "changePassword":
          // TODO: パスワード変更処理
          break
        case "changeEmail":
          // TODO: メールアドレス変更処理
          break
      }
    },
    [onCloseGetLatestAuthCredentialModal, onOpenConfirmationDeleteUserModal]
  )

  const footerFunctions = useMemo(() => {
    if (breakPoint === "SmartPhone") {
      return (
        <Stack spacing="xs">
          <Group spacing="xs" position="right" grow>
            <Button size="xs" variant="outline" color="gray">
              メールアドレス変更
            </Button>
            <Button size="xs" variant="outline" color="gray">
              パスワード変更
            </Button>
          </Group>
          <Group spacing="xs" position="right" grow>
            <Button
              size="xs"
              variant="outline"
              color="gray"
              onClick={onOpenConfirmationDeleteUserModal}
            >
              アカウント削除
            </Button>
            <Button size="xs" variant="outline" color="gray">
              キャッシュ削除
            </Button>
          </Group>
        </Stack>
      )
    }

    return (
      <Group spacing="xs" position="right" grow>
        <Button size="xs" variant="outline" color="gray">
          メールアドレス変更
        </Button>
        <Button size="xs" variant="outline" color="gray">
          パスワード変更
        </Button>
        <Button
          size="xs"
          variant="outline"
          color="gray"
          onClick={onOpenConfirmationDeleteUserModal}
        >
          アカウント削除
        </Button>
        <Button size="xs" variant="outline" color="gray">
          キャッシュ削除
        </Button>
      </Group>
    )
  }, [breakPoint, onOpenConfirmationDeleteUserModal])

  return (
    <>
      <ModalDefault
        title={
          <Flex align="center" gap="xs">
            <IoSettingsOutline />
            <Text>一般設定</Text>
          </Flex>
        }
        isOpen={isOpen}
        onClose={onClose}
      >
        <Flex align="center" justify="space-between" data-autofocus>
          <Group spacing="0.3rem">
            <PiUserCircleThin size="2.5rem" />
            <Text
              maw="27rem"
              fw={700}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {userInfo?.email}
            </Text>
          </Group>

          <Button
            variant="outline"
            size="xs"
            loading={isProcessingSignout}
            onClick={handleSignoutButtonClick}
          >
            サインアウト
          </Button>
        </Flex>

        <Divider my="sm" />

        <Stack spacing="md">
          {Object.entries(SETTING_ITEMS)
            .filter(
              ([key]) =>
                !["VERSION", "THEME", "BACKGROUND_OF_QUEUE"].includes(key)
            ) // TODO: テーマやキューの背景の実装が完了したら解放する
            .map(([key, val]) => (
              <Flex
                key={key}
                px={setRespVal("xs", "lg", "lg")}
                align="center"
                justify="space-between"
              >
                <Box>
                  <Text fw={700}>{val.label}</Text>
                  <Text fz="0.8rem" color="#868e96">
                    {val.description}
                  </Text>
                </Box>
                {isDefined(val.options) ? (
                  <Select data={val.options} defaultValue="vercel" />
                ) : (
                  <Switch
                    defaultChecked={
                      settings[key as keyof SettingValues] as boolean // val.optionsが存在しなければboolean型であることが保証されている
                    }
                    onChange={e => {
                      setSettings({
                        ...settings,
                        [key as keyof SettingValues]: e.currentTarget.checked
                      })
                    }}
                    styles={{ track: { cursor: "pointer" } }}
                  />
                )}
              </Flex>
            ))}
        </Stack>

        <Divider my="sm" />

        <Box ta="center">
          {footerFunctions}

          <Text fz="0.7rem" color="#868e96">
            ※完了後サインアウトされます
          </Text>
        </Box>
      </ModalDefault>

      <ConfirmationModal
        isOpen={isConfirmationDeleteUserModalOpen}
        title="確認"
        confirmButtonText="削除する"
        cancelButtonText="やめる"
        onConfirm={() => handleConfirmPassword("deleteUser")}
        onCancel={onCloseConfirmationDeleteUserModal}
      >
        アカウントに紐づいているユーザーデーターは一度削除すると復元できません。アカウントを削除してもよろしいですか？
      </ConfirmationModal>

      <GetLatestAuthCredentialModal
        isOpen={isGetLatestAuthCredentialModalOpen}
        onExecute={executeDeleteUser}
        onCancel={() => handleCancelGetLatestAuthCredentialModal("deleteUser")}
      />
    </>
  )
}

export default memo(SettingModal)
