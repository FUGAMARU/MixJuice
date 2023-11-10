import { Stack, Center } from "@mantine/core"
import { memo, useCallback, useMemo, useState } from "react"
import { HiOutlineMail } from "react-icons/hi"
import { PiPasswordBold } from "react-icons/pi"
import ArrowTextButton from "@/components/parts/ArrowTextButton"
import GradientButton from "@/components/parts/GradientButton"
import LabeledInput from "@/components/parts/LabeledInput"
import useAuth from "@/hooks/useAuth"
import useErrorModal from "@/hooks/useErrorModal"
import { isValidEmail, isValidPassword } from "@/utils/validation"

type Props = {
  className: string
  isDisplay: boolean
  onSlideSignupFormToEmailVerificationView: () => Promise<void>
  onBack: () => void
}

const Signup = ({
  className,
  isDisplay,
  onSlideSignupFormToEmailVerificationView,
  onBack
}: Props) => {
  const { showError } = useErrorModal()
  const { signUp } = useAuth()

  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [retypePasswordInput, setRetypePasswordInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const hasValidEmail = useMemo(() => isValidEmail(emailInput), [emailInput])
  const hasValidPassword = useMemo(
    () => isValidPassword(passwordInput),
    [passwordInput]
  )
  const isSignUpButtonDisabled = useMemo(
    () => !hasValidEmail || !hasValidPassword,
    [hasValidEmail, hasValidPassword]
  )

  const handleSignupButtonClick = useCallback(async () => {
    setIsProcessing(true)
    try {
      await signUp(emailInput, passwordInput)
      await onSlideSignupFormToEmailVerificationView()
    } catch (e) {
      showError(e)
      onBack()
    } finally {
      setIsProcessing(false)
    }
  }, [
    showError,
    emailInput,
    passwordInput,
    signUp,
    onSlideSignupFormToEmailVerificationView,
    onBack
  ])

  return (
    <Stack
      className={className}
      h="100%"
      px="xl"
      spacing="md"
      justify="center"
      sx={{ display: isDisplay ? "flex" : "none", flex: 1 }}
    >
      <Stack justify="center" spacing="xs">
        <LabeledInput
          type="email"
          icon={<HiOutlineMail />}
          label="メール"
          placeholder="mixjuice-user@example.com"
          value={emailInput}
          onChange={e => setEmailInput(e.currentTarget.value)}
        />

        <LabeledInput
          type="password"
          icon={<PiPasswordBold />}
          label="パスワード"
          placeholder="6文字以上のパスワード"
          value={passwordInput}
          onChange={e => setPasswordInput(e.currentTarget.value)}
        />

        <LabeledInput
          type="password"
          icon={<PiPasswordBold />}
          label="パスワード(再入力)"
          placeholder="6文字以上のパスワード"
          value={retypePasswordInput}
          onChange={e => setRetypePasswordInput(e.currentTarget.value)}
        />
      </Stack>

      <GradientButton
        size="sm"
        ff="notoSansJP"
        fz="0.9rem"
        fw={600}
        disabled={
          isSignUpButtonDisabled || passwordInput !== retypePasswordInput
        }
        loading={isProcessing}
        onClick={handleSignupButtonClick}
      >
        ユーザー登録
      </GradientButton>

      <Center>
        <ArrowTextButton direction="left" onClick={onBack}>
          サインイン画面に戻る
        </ArrowTextButton>
      </Center>
    </Stack>
  )
}

export default memo(Signup)
