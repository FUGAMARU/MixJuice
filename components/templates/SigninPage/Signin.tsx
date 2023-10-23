import { Stack, Group, Button } from "@mantine/core"
import { useRouter } from "next/navigation"
import { memo, useCallback, useMemo, useState } from "react"
import { HiOutlineMail } from "react-icons/hi"
import { PiPasswordBold } from "react-icons/pi"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { loadingAtom } from "@/atoms/loadingAtom"
import { spotifySettingStateAtom } from "@/atoms/spotifySettingStateAtom"
import { webDAVSettingStateAtom } from "@/atoms/webDAVSettingStateAtom"
import GradientButton from "@/components/parts/GradientButton"
import LabeledInput from "@/components/parts/LabeledInput"
import useAuth from "@/hooks/useAuth"
import useBreakPoints from "@/hooks/useBreakPoints"
import useErrorModal from "@/hooks/useErrorModal"
import { SigninPageType } from "@/types/SigninPageType"
import { isDefined } from "@/utils/isDefined"

type Props = {
  className: string
  isDisplay: boolean
  slideTo: (to: SigninPageType) => Promise<void>
}

const Signin = ({ className, isDisplay, slideTo }: Props) => {
  const { setRespVal } = useBreakPoints()
  const { showError } = useErrorModal()
  const router = useRouter()

  const { checkUserExists, signIn } = useAuth()
  const spotifySettingState = useRecoilValue(spotifySettingStateAtom)
  const webDAVSettingState = useRecoilValue(webDAVSettingStateAtom)
  const setIsLoading = useSetRecoilState(loadingAtom)

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

      if (spotifySettingState !== "done" || webDAVSettingState !== "done") {
        setIsLoading({
          stateChangedOn: "SigninPage",
          state: true
        })
        await new Promise(resolve => setTimeout(resolve, 300))
        router.push("/connect")
        return
      }

      setIsLoading({
        stateChangedOn: "SigninPage",
        state: true
      })
      await new Promise(resolve => setTimeout(resolve, 300))
      router.push("/")
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
    router,
    setIsLoading,
    spotifySettingState,
    webDAVSettingState,
    slideTo
  ])

  const isValidEmail = useMemo(
    () => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailInput),
    [emailInput]
  )
  const hasValidPassword = useMemo(
    () => passwordInput.length >= 6, // 6文字以上なのはFirebaseの仕様
    [passwordInput]
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
        />
      </Stack>

      <GradientButton
        size="sm"
        ff="notoSansJP"
        fz="0.9rem"
        fw={600}
        disabled={!isValidEmail || !hasValidPassword}
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
        >
          パスワードを忘れた
        </Button>
      </Group>
    </Stack>
  )
}

export default memo(Signin)