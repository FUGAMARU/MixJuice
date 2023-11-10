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
import { useLocalStorage } from "@mantine/hooks"

import { FirebaseError } from "firebase/app"
import { memo, useMemo } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { IoSettingsOutline } from "react-icons/io5"
import { PiUserCircleThin } from "react-icons/pi"
import ConfirmationModal from "@/components/parts/ConfirmationModal"

import InputModal from "@/components/parts/InputModal"
import ModalDefault from "@/components/parts/ModalDefault"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { DEFAULT_SETTING_VALUES, SETTING_ITEMS } from "@/constants/Settings"
import useBreakPoints from "@/hooks/useBreakPoints"
import useSettingModal from "@/hooks/useSettingModal"
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
  const [settings, setSettings] = useLocalStorage<SettingValues>({
    key: LOCAL_STORAGE_KEYS.SETTINGS,
    defaultValue: DEFAULT_SETTING_VALUES
  })
  const {
    isProcessingSignout,
    handleSignoutButtonClick,
    showSimpleError,
    reAuth,
    isConfirmationDeleteUserModalOpen,
    onOpenConfirmationDeleteUserModal,
    onCloseConfirmationDeleteUserModal,
    isConfirmationChangePasswordModalOpen,
    onOpenConfirmationChangePasswordModal,
    onCloseConfirmationChangePasswordModal,
    isConfirmationChangeEmailModalOpen,
    onOpenConfirmationChangeEmailModal,
    onCloseConfirmationChangeEmailModal,
    isInputModalForDeleteUserOpen,
    onOpenInputModalForDeleteUser,
    onCloseInputModalForDeleteUser,
    isInputCurrentPasswordModalForChangePasswordOpen,
    onOpenInputCurrentPasswordModalForChangePassword,
    onCloseInputCurrentPasswordModalForChangePassword,
    isInputNewPasswordModalForChangePasswordOpen,
    onOpenInputNewPasswordModalForChangePassword,
    onCloseInputNewPasswordModalForChangePassword,
    isInputCurrentPasswordModalForChangeEmailOpen,
    onOpenInputCurrentPasswordModalForChangeEmail,
    onCloseInputCurrentPasswordModalForChangeEmail,
    isInputNewEmailModalForChangeEmailOpen,
    onOpenInputNewEmailModalForChangeEmail,
    onCloseInputNewEmailModalForChangeEmail,
    handleConfirmForDeleteUser,
    handleConfirmForChangePassword,
    handleConfirmForChangeEmail
  } = useSettingModal({ onCloseModal: onClose })

  const footerActions = useMemo(() => {
    if (breakPoint === "SmartPhone") {
      return (
        <Stack spacing="xs">
          <Group spacing="xs" position="right" grow>
            <Button
              size="xs"
              variant="outline"
              color="gray"
              onClick={onOpenConfirmationChangeEmailModal}
            >
              メールアドレス変更
            </Button>
            <Button
              size="xs"
              variant="outline"
              color="gray"
              onClick={onOpenConfirmationChangePasswordModal}
            >
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
        <Button
          size="xs"
          variant="outline"
          color="gray"
          onClick={onOpenConfirmationChangeEmailModal}
        >
          メールアドレス変更
        </Button>
        <Button
          size="xs"
          variant="outline"
          color="gray"
          onClick={onOpenConfirmationChangePasswordModal}
        >
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
  }, [
    breakPoint,
    onOpenConfirmationDeleteUserModal,
    onOpenConfirmationChangePasswordModal,
    onOpenConfirmationChangeEmailModal
  ])

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
          {footerActions}

          <Text fz="0.7rem" color="#868e96">
            ※完了後サインアウトされます
          </Text>
        </Box>
      </ModalDefault>

      <ConfirmationModal
        isOpen={isConfirmationDeleteUserModalOpen}
        confirmButtonText="削除する"
        cancelButtonText="やめる"
        onConfirm={() => {
          onCloseConfirmationDeleteUserModal()
          onOpenInputModalForDeleteUser()
        }}
        onCancel={onCloseConfirmationDeleteUserModal}
      >
        アカウントに紐づいているユーザーデーターは一度削除すると復元できません。アカウントを削除してもよろしいですか？
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={isConfirmationChangePasswordModalOpen}
        confirmButtonText="変更する"
        cancelButtonText="やめる"
        onConfirm={() => {
          onCloseConfirmationChangePasswordModal()
          onOpenInputCurrentPasswordModalForChangePassword()
        }}
        onCancel={onCloseConfirmationChangePasswordModal}
      >
        パスワードを変更するとSpotifyやWebDAVサーバーの接続設定が再度必要になります。よろしいですか？
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={isConfirmationChangeEmailModalOpen}
        confirmButtonText="変更する"
        cancelButtonText="やめる"
        onConfirm={() => {
          onCloseConfirmationChangeEmailModal()
          onOpenInputCurrentPasswordModalForChangeEmail()
        }}
        onCancel={onCloseConfirmationChangeEmailModal}
      >
        今現在メールアドレスを変更しようとするとエラーが発生する可能性がありますが、やってみますか？
      </ConfirmationModal>

      <InputModal
        type="password"
        title="パスワードを入力"
        isOpen={isInputModalForDeleteUserOpen}
        confirmButtonText="削除する"
        onConfirm={handleConfirmForDeleteUser}
        onCancel={() => {
          onCloseInputModalForDeleteUser()
          onOpenConfirmationDeleteUserModal()
        }}
      />

      <InputModal
        type="password"
        title="現在のパスワードを入力"
        isOpen={isInputCurrentPasswordModalForChangePasswordOpen}
        confirmButtonText="次へ"
        onConfirm={async password => {
          try {
            await reAuth(password)
            onCloseInputCurrentPasswordModalForChangePassword()
            onOpenInputNewPasswordModalForChangePassword()
          } catch (e) {
            if (e instanceof FirebaseError) showSimpleError(e)
          }
        }}
        onCancel={() => {
          onCloseInputCurrentPasswordModalForChangePassword()
          onOpenConfirmationChangePasswordModal()
        }}
      />

      <InputModal
        type="password"
        title="変更後のパスワードを入力"
        isOpen={isInputNewPasswordModalForChangePasswordOpen}
        confirmButtonText="変更する"
        onConfirm={handleConfirmForChangePassword}
        onCancel={() => {
          onCloseInputNewPasswordModalForChangePassword()
          onOpenConfirmationChangePasswordModal()
        }}
      />

      <InputModal
        type="password"
        title="現在のパスワードを入力"
        isOpen={isInputCurrentPasswordModalForChangeEmailOpen}
        confirmButtonText="次へ"
        onConfirm={async password => {
          try {
            await reAuth(password)
            onCloseInputCurrentPasswordModalForChangeEmail()
            onOpenInputNewEmailModalForChangeEmail()
          } catch (e) {
            if (e instanceof FirebaseError) showSimpleError(e)
          }
        }}
        onCancel={() => {
          onCloseInputCurrentPasswordModalForChangeEmail()
          onOpenConfirmationChangeEmailModal()
        }}
      />

      <InputModal
        type="email"
        title="新しいメールアドレスを入力"
        isOpen={isInputNewEmailModalForChangeEmailOpen}
        confirmButtonText="変更する"
        onConfirm={handleConfirmForChangeEmail}
        onCancel={() => {
          onCloseInputNewEmailModalForChangeEmail()
          onOpenConfirmationChangeEmailModal()
        }}
      />
    </>
  )
}

export default memo(SettingModal)
