import { Stack, Group, Button } from "@mantine/core"
import { memo, useCallback, useMemo, useState, KeyboardEvent } from "react"
import { HiOutlineMail } from "react-icons/hi"
import { PiPasswordBold } from "react-icons/pi"
import GradientButton from "@/components/parts/GradientButton"
import LabeledInput from "@/components/parts/LabeledInput"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { PAGE_PATH } from "@/constants/PagePath"
import useAuth from "@/hooks/useAuth"
import useBreakPoints from "@/hooks/useBreakPoints"
import useErrorModal from "@/hooks/useErrorModal"
import useSpotifySettingState from "@/hooks/useSpotifySettingState"
import useStorage from "@/hooks/useStorage"
import useTransit from "@/hooks/useTransit"
import useWebDAVSettingState from "@/hooks/useWebDAVSettingState"
import { SigninPageType } from "@/types/SigninPageType"
import { isDefined } from "@/utils/isDefined"

type Props = {
  className: string
  isDisplay: boolean
  slideTo: (to: SigninPageType) => Promise<void>
}

const Signin = ({ className, isDisplay, slideTo }: Props) => {
  const { onTransit } = useTransit()
  const { setRespVal } = useBreakPoints()
  const { showError } = useErrorModal()

  const { checkUserExists, signIn } = useAuth()
  const { getCurrentUserData, setHashedPassword, setDecryptionVerifyString } =
    useStorage({ initialize: false })
  const { getSettingState: getSpotifySettingState } = useSpotifySettingState({
    initialize: false
  })
  const { getSettingState: getWebDAVSettingState } = useWebDAVSettingState({
    initialize: false
  })

  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSinginButtonClick = useCallback(async () => {
    setIsProcessing(true)
    try {
      const isUserExists = await checkUserExists(emailInput)
      if (!isUserExists) {
        await slideTo("signup")
        return
      }

      const userCredential = await signIn(emailInput, passwordInput)
      if (isDefined(userCredential) && !userCredential.user.emailVerified) {
        await slideTo("emailVerification")
        return
      }

      setHashedPassword(passwordInput)
      await setDecryptionVerifyString(emailInput)

      const userData = await getCurrentUserData(emailInput)
      const spotifySettingState = getSpotifySettingState(
        userData[FIRESTORE_DOCUMENT_KEYS.SPOTIFY_REFRESH_TOKEN]
      )
      const webDAVSettingState = getWebDAVSettingState(
        userData[FIRESTORE_DOCUMENT_KEYS.WEBDAV_SERVER_CREDENTIALS]
      )

      if (spotifySettingState !== "done" && webDAVSettingState !== "done") {
        await onTransit(PAGE_PATH.SIGNIN_PAGE, PAGE_PATH.CONNECT_PAGE)
        return
      }

      await onTransit(PAGE_PATH.SIGNIN_PAGE, PAGE_PATH.MAIN_PAGE)
    } catch (e) {
      showError(e)
    } finally {
      setIsProcessing(false)
    }
  }, [
    checkUserExists,
    emailInput,
    passwordInput,
    signIn,
    showError,
    slideTo,
    onTransit,
    getCurrentUserData,
    getSpotifySettingState,
    getWebDAVSettingState,
    setHashedPassword,
    setDecryptionVerifyString
  ])

  const isValidEmail = useMemo(
    () => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailInput),
    [emailInput]
  )
  const isValidPassword = useMemo(
    () => passwordInput.length >= 6, // 6文字以上なのはFirebaseの仕様
    [passwordInput]
  )
  const isSigninButtonDisabled = useMemo(
    () => !isValidEmail || !isValidPassword,
    [isValidEmail, isValidPassword]
  )

  const handlePasswordKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (
        e.nativeEvent.isComposing ||
        e.key !== "Enter" ||
        isSigninButtonDisabled
      )
        return
      handleSinginButtonClick()
    },
    [handleSinginButtonClick, isSigninButtonDisabled]
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
          placeholder="パスワード"
          value={passwordInput}
          onChange={e => setPasswordInput(e.currentTarget.value)}
          onKeyDown={handlePasswordKeyDown}
        />
      </Stack>

      <GradientButton
        size="sm"
        ff="notoSansJP"
        fz="0.9rem"
        fw={600}
        disabled={isSigninButtonDisabled}
        loading={isProcessing}
        onClick={handleSinginButtonClick}
      >
        サインイン
      </GradientButton>

      <Group grow>
        <Button
          size="xs"
          variant="outline"
          color="blue"
          onClick={() => slideTo("signup")}
        >
          ユーザー登録
        </Button>

        <Button
          size="xs"
          variant="outline"
          color="blue"
          fz={setRespVal("0.7rem", "0.8rem", "0.8rem")}
          styles={{ label: { lineHeight: 0 } }}
          onClick={() => slideTo("forgotPassword")}
        >
          パスワードを忘れた
        </Button>
      </Group>
    </Stack>
  )
}

export default memo(Signin)
