"use client"

import {
  Center,
  Box,
  Input,
  Divider,
  Button,
  Flex,
  Text,
  PasswordInput,
  Stack,
  Group
} from "@mantine/core"
import { sendEmailVerification } from "firebase/auth"
import Image from "next/image"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { HiOutlineMail } from "react-icons/hi"
import { PiPasswordBold } from "react-icons/pi"
import { TfiEmail } from "react-icons/tfi"
import { useRecoilValue } from "recoil"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import CardViewDefault from "@/components/parts/CardViewDefault"
import { STYLING_VALUES } from "@/constants/StylingValues"
import useAuth from "@/hooks/useAuth"
import useBreakPoints from "@/hooks/useBreakPoints"
import useErrorModal from "@/hooks/useErrorModal"
import useTouchDevice from "@/hooks/useTouchDevice"
import styles from "@/styles/SigninPage.module.css"
import { greycliffCF } from "@/styles/fonts"
import { isDefined } from "@/utils/isDefined"

const SigninPage = () => {
  const { showError } = useErrorModal()
  const { setRespVal } = useBreakPoints()
  const { isTouchDevice } = useTouchDevice()
  const faviconIndex = useRecoilValue(faviconIndexAtom)

  const { checkUserExists, signUp, user } = useAuth()

  const [authState, setAuthState] = useState<
    "NOT_SIGNIN" | "NOT_REGISTERED" | "EMAIL_NOT_VERIFIED" | "DONE"
  >("NOT_SIGNIN")

  const [isGoButtonLoading, setIsGoButtonLoading] = useState(false)
  const [
    isResendVerificationMailButtonLoading,
    setIsResendVerificationMailButtonLoading
  ] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const retypePasswordRef = useRef<HTMLInputElement>(null)

  const handleGoButtonClick = useCallback(async () => {
    setIsGoButtonLoading(true)

    try {
      switch (authState) {
        case "NOT_SIGNIN":
          const isUserExists = await checkUserExists(
            emailRef.current?.value ?? ""
          )
          if (!isUserExists) {
            setAuthState("NOT_REGISTERED")
            return
          }

          if (isDefined(user) && !user.emailVerified) {
            setAuthState("EMAIL_NOT_VERIFIED")
            return
          }

          try {
            // TODO: サインイン処理
            console.log("サインイン処理")
            setAuthState("DONE")
          } catch {}
          break
        case "NOT_REGISTERED":
          try {
            await signUp(
              emailRef.current?.value ?? "",
              passwordRef.current?.value ?? ""
            )
            setAuthState("EMAIL_NOT_VERIFIED")
          } catch (e) {
            showError(e)
          }
          break
      }
    } finally {
      setIsGoButtonLoading(false)
    }
  }, [authState, checkUserExists, signUp, user, showError])

  const handleResendVerificationMailButtonClick = useCallback(async () => {
    if (!isDefined(user)) return

    setIsResendVerificationMailButtonLoading(true)
    await sendEmailVerification(user)
    setIsResendVerificationMailButtonLoading(false)
  }, [user])

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
          <Flex>
            <Center
              px="0.5rem"
              bg={STYLING_VALUES.TEXT_COLOR_DEFAULT}
              sx={{
                borderTopLeftRadius: "5px",
                borderBottomLeftRadius: "5px",
                border: "solid 1px gray",
                color: "white"
              }}
            >
              <Group spacing="0.2rem">
                <HiOutlineMail />
                <Text fz="0.8rem" fw={700} color="white">
                  メール
                </Text>
              </Group>
            </Center>
            <Input
              w="100%"
              size="xs"
              type="email"
              placeholder="mixjuice-user@example.com"
              sx={{ flex: 1 }}
              styles={{
                input: {
                  borderTopLeftRadius: "0px",
                  borderBottomLeftRadius: "0px",
                  borderTopRightRadius: "5px",
                  borderBottomRightRadius: "5px",
                  borderWidth: "1px",
                  borderLeftWidth: "0px",
                  height: "auto" // 指定しないとテキストが若干下にずれる
                }
              }}
              ref={emailRef}
            />
          </Flex>

          <Flex>
            <Center
              px="0.5rem"
              bg={STYLING_VALUES.TEXT_COLOR_DEFAULT}
              sx={{
                borderTopLeftRadius: "5px",
                borderBottomLeftRadius: "5px",
                border: "solid 1px gray",
                color: "white"
              }}
            >
              <Group spacing="0.2rem">
                <PiPasswordBold />
                <Text fz="0.8rem" fw={700} color="white">
                  パスワード
                </Text>
              </Group>
            </Center>
            <PasswordInput
              w="100%"
              size="xs"
              placeholder="6文字以上のパスワード"
              sx={{ flex: 1 }}
              styles={{
                input: {
                  borderTopLeftRadius: "0px",
                  borderBottomLeftRadius: "0px",
                  borderTopRightRadius: "5px",
                  borderBottomRightRadius: "5px",
                  borderWidth: "1px",
                  borderLeftWidth: "0px",
                  height: "auto" // 指定しないとテキストが若干下にずれる
                }
              }}
              ref={passwordRef}
            />
          </Flex>

          <Box
            className={
              authState === "NOT_REGISTERED"
                ? styles.slideIn
                : authState === "EMAIL_NOT_VERIFIED"
                ? styles.slideOut
                : styles.retypePassword
            }
          >
            <Flex
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
              <Center
                px="0.5rem"
                bg={STYLING_VALUES.TEXT_COLOR_DEFAULT}
                sx={{
                  borderTopLeftRadius: "5px",
                  borderBottomLeftRadius: "5px",
                  border: "solid 1px gray",
                  color: "white"
                }}
              >
                <Group spacing="0.2rem">
                  <PiPasswordBold />
                  <Text fz="0.8rem" fw={700} color="white">
                    パスワード(再入力)
                  </Text>
                </Group>
              </Center>
              <PasswordInput
                w="100%"
                size="xs"
                placeholder="6文字以上のパスワード"
                sx={{ flex: 1 }}
                styles={{
                  input: {
                    borderTopLeftRadius: "0px",
                    borderBottomLeftRadius: "0px",
                    borderTopRightRadius: "5px",
                    borderBottomRightRadius: "5px",
                    borderWidth: "1px",
                    borderLeftWidth: "0px",
                    height: "auto" // 指定しないとテキストが若干下にずれる
                  }
                }}
                ref={retypePasswordRef}
              />
            </Flex>
          </Box>

          <Center>
            <Button
              size="xs"
              ff={greycliffCF.style.fontFamily}
              fz="1rem"
              fw={800}
              variant="gradient"
              gradient={{ from: "#2afadf", to: "#4c83ff" }}
              sx={{
                transition: "all .2s ease-in-out",
                "&:hover": {
                  transform: isTouchDevice ? "" : "scale(1.02)"
                }
              }}
              loading={isGoButtonLoading}
              loaderProps={{ type: "dots" }}
              //disabled={checkedItems.length === 0}
              onClick={handleGoButtonClick}
            >
              {authState === "NOT_REGISTERED" ? "REGISTER!" : "GO!"}
            </Button>
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
            <Button
              size="xs"
              fz="0.9rem"
              fw={600}
              variant="gradient"
              gradient={{ from: "#2afadf", to: "#4c83ff" }}
              sx={{
                transition: "all .2s ease-in-out",
                "&:hover": {
                  transform: isTouchDevice ? "" : "scale(1.02)"
                }
              }}
              loading={isResendVerificationMailButtonLoading}
              loaderProps={{ type: "dots" }}
              onClick={handleResendVerificationMailButtonClick}
            >
              再送信する
            </Button>

            <Button
              size="xs"
              fz="0.9rem"
              fw={600}
              variant="gradient"
              gradient={{ from: "#2afadf", to: "#4c83ff" }}
              sx={{
                transition: "all .2s ease-in-out",
                "&:hover": {
                  transform: isTouchDevice ? "" : "scale(1.02)"
                }
              }}
              onClick={() => window.location.reload()}
            >
              クリックした
            </Button>
          </Group>
        </Box>
      </Flex>
    </CardViewDefault>
  )
}

export default memo(SigninPage)
