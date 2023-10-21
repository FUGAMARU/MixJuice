"use client"

import { Center, Box, Divider, Flex, Text, Stack, Group } from "@mantine/core"
import { usePrevious } from "@mantine/hooks"
import { sendEmailVerification } from "firebase/auth"
import Image from "next/image"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { HiOutlineMail } from "react-icons/hi"
import { PiPasswordBold } from "react-icons/pi"
import { TfiEmail } from "react-icons/tfi"
import { useRecoilValue } from "recoil"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import CardViewDefault from "@/components/parts/CardViewDefault"
import GradientButton from "@/components/parts/GradientButton"
import LabeledInput from "@/components/parts/LabeledInput"
import { STYLING_VALUES } from "@/constants/StylingValues"
import useAuth from "@/hooks/useAuth"
import useBreakPoints from "@/hooks/useBreakPoints"
import useErrorModal from "@/hooks/useErrorModal"
import styles from "@/styles/SigninPage.module.css"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

const SigninPage = () => {
  const { showError } = useErrorModal()
  const { setRespVal } = useBreakPoints()
  const faviconIndex = useRecoilValue(faviconIndexAtom)
  const [userInfo] = useAuthState(auth)

  const { checkUserExists, signUp, signIn, signOut } = useAuth()

  const [authState, setAuthState] = useState<
    "NOT_SIGNIN" | "NOT_REGISTERED" | "EMAIL_NOT_VERIFIED" | "DONE"
  >("NOT_SIGNIN")
  const previousAuthState = usePrevious(authState)

  const [isGoButtonLoading, setIsGoButtonLoading] = useState(false)
  const [
    isResendVerificationMailButtonLoading,
    setIsResendVerificationMailButtonLoading
  ] = useState(false)

  const [emailInput, setEmailInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [retypePasswordInput, setRetypePasswordInput] = useState("")

  const isValidEmail = useMemo(
    () => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailInput),
    [emailInput]
  )
  const hasValidPassword = useMemo(
    () => passwordInput.length >= 6, // 6文字以上なのはFirebaseの仕様
    [passwordInput]
  )
  const hasValidRetypePassword = useMemo(
    () => retypePasswordInput === passwordInput,
    [retypePasswordInput, passwordInput]
  )
  const canClickGoButton = useMemo(() => {
    switch (authState) {
      case "NOT_SIGNIN":
        return isValidEmail && hasValidPassword
      case "NOT_REGISTERED":
        return isValidEmail && hasValidPassword && hasValidRetypePassword
      default:
        return false
    }
  }, [authState, isValidEmail, hasValidPassword, hasValidRetypePassword])

  const handleGoButtonClick = useCallback(async () => {
    setIsGoButtonLoading(true)

    try {
      switch (authState) {
        case "NOT_SIGNIN":
          const isUserExists = await checkUserExists(emailInput)
          if (!isUserExists) {
            setAuthState("NOT_REGISTERED")
            return
          }

          try {
            const userCredential = await signIn(emailInput, passwordInput)

            if (
              isDefined(userCredential) &&
              !userCredential.user.emailVerified
            ) {
              setAuthState("EMAIL_NOT_VERIFIED")
              return
            }

            setAuthState("DONE")
            //TODO: リダイレクト処理 (Provider設定の進み具合によって遷移先を出し分ける)
          } catch (e) {
            showError(e)
          }
          break
        case "NOT_REGISTERED":
          try {
            await signUp(emailInput, passwordInput)
            setAuthState("EMAIL_NOT_VERIFIED")
          } catch (e) {
            showError(e)
          }
          break
      }
    } finally {
      setIsGoButtonLoading(false)
    }
  }, [
    authState,
    checkUserExists,
    signUp,
    showError,
    emailInput,
    passwordInput,
    signIn
  ])

  const handleResendVerificationMailButtonClick = useCallback(async () => {
    if (!isDefined(userInfo)) return

    try {
      setIsResendVerificationMailButtonLoading(true)
      await sendEmailVerification(userInfo)
      setIsResendVerificationMailButtonLoading(false)
    } catch (e) {
      showError(e)
    }
  }, [userInfo, showError])

  const handleClickedButtonClick = useCallback(async () => {
    await signOut()
    window.location.reload()
  }, [signOut])

  const [isDisplaySigninForm, setIsDisplaySigninForm] = useState(true)
  const [isDisplayVerificationEmailText, setIsDisplayVerificationEmailText] =
    useState(false)
  useEffect(() => {
    ;(async () => {
      if (authState !== "EMAIL_NOT_VERIFIED") return

      await new Promise(resolve => setTimeout(resolve, 500))
      setIsDisplaySigninForm(false)
      setIsDisplayVerificationEmailText(true)
    })()
  }, [authState])

  return (
    <CardViewDefault h="20rem" w={setRespVal("85%", "25rem", "25rem")}>
      <Flex
        h="100%"
        direction="column"
        justify="center"
        sx={{
          transition: "all .2s ease-in-out"
        }}
      >
        <Stack spacing="0.3rem">
          <Box ta="center">
            <Image
              src={`/header-logos/header-${faviconIndex}.png`}
              width={228}
              height={60}
              alt="Randomized MixJuice Logo"
            />
          </Box>
          <Text fz={setRespVal("0.7rem", "0.75rem", "0.75rem")}>
            サービスを利用するにはサインインが必要です
          </Text>
        </Stack>

        <Divider mt="sm" mb="xl" variant="dotted" />

        <Stack
          className={
            authState === "EMAIL_NOT_VERIFIED"
              ? "animate__animated animate__fadeOut"
              : ""
          }
          spacing="md"
          sx={{ display: isDisplaySigninForm ? "flex" : "none" }}
        >
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

          <Box
            className={
              authState === "NOT_REGISTERED"
                ? styles.slideIn
                : previousAuthState === "NOT_REGISTERED" &&
                  authState === "EMAIL_NOT_VERIFIED"
                ? styles.slideOut
                : styles.retypePassword
            }
          >
            <Box
              w="100%"
              className={
                authState === "NOT_REGISTERED"
                  ? "animate__animated animate__fadeIn"
                  : authState === "EMAIL_NOT_VERIFIED"
                  ? "animate__animated animate__fadeOut"
                  : ""
              }
              sx={{
                animationDelay: authState === "NOT_REGISTERED" ? ".5s" : "0"
              }}
            >
              <LabeledInput
                type="password"
                icon={<PiPasswordBold />}
                label="パスワード(再入力)"
                placeholder="6文字以上のパスワード"
                value={retypePasswordInput}
                onChange={e => setRetypePasswordInput(e.currentTarget.value)}
              />
            </Box>
          </Box>

          <Center>
            <GradientButton
              size="xs"
              ff="greycliffCF"
              fz="1rem"
              fw={800}
              disabled={!canClickGoButton}
              loading={isGoButtonLoading}
              onClick={handleGoButtonClick}
            >
              {authState === "NOT_REGISTERED" ? "REGISTER!" : "GO!"}
            </GradientButton>
          </Center>
        </Stack>

        <Box
          className={
            isDisplayVerificationEmailText
              ? "animate__animated animate__fadeIn"
              : ""
          }
          sx={{
            display: isDisplayVerificationEmailText ? "box" : "none",
            animationDelay: ".5s"
          }}
        >
          <TfiEmail size="2rem" color={STYLING_VALUES.TEXT_COLOR_DEFAULT} />
          <Text mt="0.3rem" mb="sm" fz="0.8rem" fw={700}>
            入力したメールアドレスに送信されたリンクをクリックしてメールアドレスを確認してください
          </Text>

          <Group sx={{ justifyContent: "center" }}>
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
        </Box>
      </Flex>
    </CardViewDefault>
  )
}

export default memo(SigninPage)
