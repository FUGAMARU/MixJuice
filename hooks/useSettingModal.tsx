import { useDisclosure } from "@mantine/hooks"
import { FirebaseError } from "firebase/app"
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  updatePassword,
  updateEmail
} from "firebase/auth"
import { useCallback, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import useAuth from "./useAuth"
import useLogger from "./useLogger"
import useStorage from "./useStorage"
import useTransit from "./useTransit"
import { PAGE_PATH } from "@/constants/PagePath"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

type Args = {
  onCloseModal: () => void
}

const useSettingModal = ({ onCloseModal }: Args) => {
  const showLog = useLogger()
  const [userInfo] = useAuthState(auth)
  const { deleteUserData, deleteAllUserData } = useStorage({
    initialize: false
  })
  const { signOut, checkUserExists } = useAuth()
  const { onTransit } = useTransit()

  const [isProcessingSignout, setIsProcessingSignout] = useState(false)
  const handleSignoutButtonClick = useCallback(async () => {
    setIsProcessingSignout(true)
    await signOut()
    onCloseModal()
    await onTransit(PAGE_PATH.MAIN_PAGE, PAGE_PATH.SIGNIN_PAGE)
  }, [signOut, onCloseModal, onTransit])

  const showSimpleError = useCallback(
    (e: FirebaseError) => {
      switch (
        e.code // TODO: エラーコード対応拡充？？ (https://firebase.google.com/docs/reference/js/v8/firebase.FirebaseError#code)
      ) {
        case "auth/invalid-login-credentials":
          alert(
            "サインインに失敗しました。パスワードが間違っている可能性があります。"
          ) // TODO: useErrorModalのshowErrorを使うとz-indexを指定しても最前面に表示されないのでwindow.alertにて暫定対応
          break
        default:
          showLog("error", e)
          alert("何らかの原因でサインインに失敗しました") // TODO: useErrorModalのshowErrorを使うとz-indexを指定しても最前面に表示されないのでwindow.alertにて暫定対応
      }
    },
    [showLog]
  )

  const reAuth = useCallback(
    async (password: string) => {
      if (!isDefined(userInfo) || !isDefined(userInfo.email)) return

      const authCredential = EmailAuthProvider.credential(
        userInfo.email,
        password
      )

      return await reauthenticateWithCredential(userInfo, authCredential)
    },
    [userInfo]
  )

  /** 操作確認モーダルの表示に関する状態管理 */
  const [
    isConfirmationDeleteUserModalOpen,
    {
      open: onOpenConfirmationDeleteUserModal,
      close: onCloseConfirmationDeleteUserModal
    }
  ] = useDisclosure(false)
  const [
    isConfirmationChangePasswordModalOpen,
    {
      open: onOpenConfirmationChangePasswordModal,
      close: onCloseConfirmationChangePasswordModal
    }
  ] = useDisclosure(false)
  const [
    isConfirmationChangeEmailModalOpen,
    {
      open: onOpenConfirmationChangeEmailModal,
      close: onCloseConfirmationChangeEmailModal
    }
  ] = useDisclosure(false)

  /** ログイン情報の入力を受け付けるモーダルの表示に関する状態管理 */
  const [
    isInputModalForDeleteUserOpen,
    {
      open: onOpenInputModalForDeleteUser,
      close: onCloseInputModalForDeleteUser
    }
  ] = useDisclosure(false)
  const [
    isInputCurrentPasswordModalForChangePasswordOpen,
    {
      open: onOpenInputCurrentPasswordModalForChangePassword,
      close: onCloseInputCurrentPasswordModalForChangePassword
    }
  ] = useDisclosure(false)
  const [
    isInputNewPasswordModalForChangePasswordOpen,
    {
      open: onOpenInputNewPasswordModalForChangePassword,
      close: onCloseInputNewPasswordModalForChangePassword
    }
  ] = useDisclosure(false)
  const [
    isInputCurrentPasswordModalForChangeEmailOpen,
    {
      open: onOpenInputCurrentPasswordModalForChangeEmail,
      close: onCloseInputCurrentPasswordModalForChangeEmail
    }
  ] = useDisclosure(false)
  const [
    isInputNewEmailModalForChangeEmailOpen,
    {
      open: onOpenInputNewEmailModalForChangeEmail,
      close: onCloseInputNewEmailModalForChangeEmail
    }
  ] = useDisclosure(false)

  /** ログイン情報を入力した後に実際の処理を行う関数 */
  const handleConfirmForDeleteUser = useCallback(
    async (password: string) => {
      try {
        const newUserCredential = await reAuth(password)
        if (
          !isDefined(newUserCredential) ||
          !isDefined(newUserCredential.user.email)
        )
          return

        await deleteUser(newUserCredential.user)
        await deleteUserData(newUserCredential.user.email)
        await onTransit(PAGE_PATH.MAIN_PAGE, PAGE_PATH.SIGNIN_PAGE)
      } catch (e) {
        if (e instanceof FirebaseError) showSimpleError(e)
      }
    },
    [deleteUserData, onTransit, showSimpleError, reAuth]
  )

  const handleConfirmForChangePassword = useCallback(
    async (newPassword: string) => {
      try {
        if (!isDefined(userInfo) || !isDefined(userInfo.email)) return

        await updatePassword(userInfo, newPassword)
        await deleteAllUserData(userInfo.email)
        await signOut()
        await onTransit(PAGE_PATH.MAIN_PAGE, PAGE_PATH.SIGNIN_PAGE)
      } catch (e) {
        if (e instanceof FirebaseError) showSimpleError(e)
      }
    },
    [deleteAllUserData, showSimpleError, userInfo, onTransit, signOut]
  )

  const handleConfirmForChangeEmail = useCallback(
    async (email: string) => {
      try {
        if (!isDefined(userInfo)) return

        const isUserExists = await checkUserExists(email)
        if (isUserExists)
          throw new Error("既に利用されているメールアドレスです")

        await updateEmail(userInfo, email) // TODO: なぜかエラーが出て変更できない
        await signOut()
        await onTransit(PAGE_PATH.MAIN_PAGE, PAGE_PATH.SIGNIN_PAGE)
      } catch (e) {
        if (e instanceof FirebaseError) showSimpleError(e)
        if (e instanceof Error) alert(e.message)
      }
    },
    [showSimpleError, userInfo, checkUserExists, onTransit, signOut]
  )

  return {
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
  } as const
}

export default useSettingModal
