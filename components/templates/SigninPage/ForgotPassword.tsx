import { Stack, Center } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { sendPasswordResetEmail } from "firebase/auth"
import { memo, useCallback, useMemo, useState, KeyboardEvent } from "react"
import { HiOutlineMail } from "react-icons/hi"
import ArrowTextButton from "@/components/parts/ArrowTextButton"
import ConfirmationModal from "@/components/parts/ConfirmationModal"
import GradientButton from "@/components/parts/GradientButton"
import LabeledInput from "@/components/parts/LabeledInput"
import useAuth from "@/hooks/useAuth"
import useErrorModal from "@/hooks/useErrorModal"
import useStorage from "@/hooks/useStorage"
import { auth } from "@/utils/firebase"

type Props = {
  className: string
  isDisplay: boolean
  onBack: () => void
}

const ForgotPassword = ({ className, isDisplay, onBack }: Props) => {
  const { showError } = useErrorModal()
  const { checkUserExists } = useAuth()
  const { deleteAllUserData } = useStorage({ initialize: false })
  const [
    isConfirmationModalOpen,
    { open: onOpenConfirmationModal, close: onCloseConfirmationModal }
  ] = useDisclosure(false)

  const [isProcessing, setIsProcessing] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const isValidEmail = useMemo(
    () => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailInput),
    [emailInput]
  )

  const handleSendPasswordResetEmailButtonClick = useCallback(async () => {
    try {
      setIsProcessing(true)

      const isUserExists = await checkUserExists(emailInput)
      if (!isUserExists) {
        throw new Error(
          "入力されたメールアドレスで登録されているユーザーが存在しません"
        )
      }

      onOpenConfirmationModal()
    } catch (e) {
      showError(e)
      setIsProcessing(false)
    }
  }, [emailInput, showError, checkUserExists, onOpenConfirmationModal])

  const handleModalConfirm = useCallback(async () => {
    try {
      onCloseConfirmationModal()
      await sendPasswordResetEmail(auth, emailInput)
      await deleteAllUserData(emailInput)
    } catch (e) {
      showError(e)
    } finally {
      setIsProcessing(false)
      onBack()
    }
  }, [
    emailInput,
    showError,
    onBack,
    deleteAllUserData,
    onCloseConfirmationModal
  ])

  const handleModalCancel = useCallback(() => {
    setIsProcessing(false)
    onCloseConfirmationModal()
  }, [onCloseConfirmationModal])

  const handleEmailKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing || e.key !== "Enter" || !isValidEmail)
        return
      handleSendPasswordResetEmailButtonClick()
    },
    [handleSendPasswordResetEmailButtonClick, isValidEmail]
  )

  return (
    <Stack
      className={className}
      h="100%"
      px="xl"
      spacing="md"
      justify="center"
      sx={{ display: isDisplay ? "flex" : "none", flex: 1 }}
    >
      <LabeledInput
        type="email"
        icon={<HiOutlineMail />}
        label="メール"
        placeholder="mixjuice-user@example.com"
        value={emailInput}
        onChange={e => setEmailInput(e.currentTarget.value)}
        onKeyDown={handleEmailKeyDown}
      />

      <GradientButton
        size="sm"
        ff="notoSansJP"
        fz="0.9rem"
        fw={600}
        disabled={!isValidEmail}
        loading={isProcessing}
        onClick={handleSendPasswordResetEmailButtonClick}
      >
        パスワードリセットメールを送信
      </GradientButton>

      <Center>
        <ArrowTextButton direction="left" onClick={onBack}>
          サインイン画面に戻る
        </ArrowTextButton>
      </Center>

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        confirmButtonText="リセットする"
        cancelButtonText="やめる"
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      >
        パスワードをリセットするとSpotifyやWebDAVサーバーの接続設定が再度必要になります。よろしいですか？
      </ConfirmationModal>
    </Stack>
  )
}

export default memo(ForgotPassword)
