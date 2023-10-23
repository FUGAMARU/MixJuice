import { Box, Center, Group, Stack, Text } from "@mantine/core"
import { sendEmailVerification } from "firebase/auth"
import { memo, useCallback, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { TfiEmail } from "react-icons/tfi"
import ArrowTextButton from "@/components/parts/ArrowTextButton"
import GradientButton from "@/components/parts/GradientButton"
import { STYLING_VALUES } from "@/constants/StylingValues"
import useAuth from "@/hooks/useAuth"
import useErrorModal from "@/hooks/useErrorModal"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

type Props = {
  className: string
  isDisplay: boolean
  onBack: () => void
}

const EmailVerification = ({ className, isDisplay, onBack }: Props) => {
  const { showError } = useErrorModal()
  const [userInfo] = useAuthState(auth)
  const { signOut } = useAuth()

  const [
    isResendVerificationMailButtonLoading,
    setIsResendVerificationMailButtonLoading
  ] = useState(false)

  const handleResendVerificationMailButtonClick = useCallback(async () => {
    if (!isDefined(userInfo)) return

    try {
      setIsResendVerificationMailButtonLoading(true)
      await sendEmailVerification(userInfo)
      setIsResendVerificationMailButtonLoading(false)
    } catch (e) {
      console.log("🟥ERROR: ", e)
      showError(new Error("メールアドレス認証用メールの送信に失敗しました"))
      onBack()
    }
  }, [showError, userInfo, onBack])

  const handleClickedButtonClick = useCallback(async () => {
    await signOut()
    window.location.reload()
  }, [signOut])

  return (
    <Stack
      className={className}
      h="100%"
      px="xl"
      spacing="lg"
      justify="center"
      sx={{ display: isDisplay ? "flex" : "none", flex: 1 }}
    >
      <Box>
        <Box mx="auto">
          <TfiEmail size="2.5rem" color={STYLING_VALUES.TEXT_COLOR_DEFAULT} />
        </Box>
        <Text fz="0.8rem" fw={700}>
          入力したメールアドレスに送信されたリンクをクリックしてメールアドレスを確認してください
        </Text>
      </Box>

      <Group grow sx={{ justifyContent: "center" }}>
        <GradientButton
          size="xs"
          ff="notoSansJP"
          fz="0.9rem"
          fw={600}
          loading={isResendVerificationMailButtonLoading}
          onClick={handleResendVerificationMailButtonClick}
        >
          再送信する
        </GradientButton>

        <GradientButton
          size="xs"
          ff="notoSansJP"
          fz="0.9rem"
          fw={600}
          onClick={handleClickedButtonClick}
        >
          クリックした
        </GradientButton>
      </Group>

      <Center>
        <ArrowTextButton direction="left" onClick={onBack}>
          サインイン画面に戻る
        </ArrowTextButton>
      </Center>
    </Stack>
  )
}

export default memo(EmailVerification)
