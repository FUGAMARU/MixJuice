"use client"

import { Flex, Box, Text } from "@mantine/core"
import Image from "next/image"
import {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useEffect,
  useState
} from "react"
import { useRecoilValue } from "recoil"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import CardViewDefault from "@/components/parts/CardViewDefault"
import EmailVerification from "@/components/templates/SigninPage/EmailVerification"
import Signin from "@/components/templates/SigninPage/Signin"
import Signup from "@/components/templates/SigninPage/Signup"
import useBreakPoints from "@/hooks/useBreakPoints"
import { SigninPageType } from "@/types/SigninPageType"
import { getRandomArtwork } from "@/utils/getRandomArtwork"

const SigninPage = () => {
  const { setRespVal } = useBreakPoints()
  const faviconIndex = useRecoilValue(faviconIndexAtom)

  const [isDisplaySinginForm, setIsDisplaySigninForm] = useState(true)
  const [isDisplaySignupForm, setIsDisplaySignupForm] = useState(false)
  const [isDisplayEmailVerificationView, setIsDisplayEmailVerificationView] =
    useState(false)
  const [isDisplayForgotPasswordForm, setIsDisplayForgotPasswordForm] =
    useState(false)

  const [signinFormClassName, setSigninFormClassName] = useState("")
  const [signupFormClassName, setSignupFormClassName] = useState("")
  const [emailVerificationFormClassName, setEmailVerificationFormClassName] =
    useState("")
  const [forgotPasswordFormClassName, setForgotPasswordFormClassName] =
    useState("")

  // スライドによる画面遷移
  const onSlide = useCallback(
    async (
      direction: "go" | "back",
      classNameDispatcher: Dispatch<SetStateAction<string>>,
      displayDispatcher: Dispatch<SetStateAction<boolean>>
    ) => {
      switch (direction) {
        case "go":
          setSigninFormClassName(
            "animate__animated animate__fadeOutLeft animate__fast"
          )
          await new Promise(resolve => setTimeout(resolve, 600))
          setIsDisplaySigninForm(false)

          classNameDispatcher(
            "animate__animated animate__slideInRight animate__fast"
          )
          displayDispatcher(true)
          break
        case "back":
          classNameDispatcher(
            "animate__animated animate__fadeOutRight animate__fast"
          )
          await new Promise(resolve => setTimeout(resolve, 600))
          displayDispatcher(false)

          setSigninFormClassName(
            "animate__animated animate__slideInLeft animate__fast"
          )
          setIsDisplaySigninForm(true)
          break
      }
    },
    []
  )

  const slideSignupFormToEmailVerificationView = useCallback(async () => {
    setSignupFormClassName(
      "animate__animated animate__fadeOutLeft animate__fast"
    )
    await new Promise(resolve => setTimeout(resolve, 600))
    setIsDisplaySignupForm(false)

    setEmailVerificationFormClassName(
      "animate__animated animate__slideInRight animate__fast"
    )
    setIsDisplayEmailVerificationView(true)
  }, [])

  const slideTo = useCallback(
    async (to: SigninPageType) => {
      switch (to) {
        case "signup":
          onSlide("go", setSignupFormClassName, setIsDisplaySignupForm)
          break
        case "emailVerification":
          onSlide(
            "go",
            setEmailVerificationFormClassName,
            setIsDisplayEmailVerificationView
          )
          break
        case "forgotPassword":
          onSlide(
            "go",
            setForgotPasswordFormClassName,
            setIsDisplayForgotPasswordForm
          )
          break
      }
    },
    [onSlide]
  )

  const [headerArtworkSrc, setHeaderArtworkSrc] = useState("")
  useEffect(() => {
    setHeaderArtworkSrc(getRandomArtwork())
  }, [])

  return (
    <CardViewDefault
      h="22rem"
      w={setRespVal("85%", "25rem", "25rem")}
      px={0}
      py={0}
    >
      <Flex h="100%" direction="column">
        <Box
          sx={{
            backgroundImage: `url('${headerArtworkSrc}')`,
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        >
          <Box
            py="md"
            ta="center"
            sx={{ backdropFilter: "blur(5px) brightness(0.8)" }}
          >
            <Image
              src={`/header-logos/white/header-white-${faviconIndex}.png`}
              width={228}
              height={60}
              alt="Randomized MixJuice Logo"
            />
            <Text color="white" fz={setRespVal("0.7rem", "0.75rem", "0.75rem")}>
              サービスを利用するにはサインインが必要です
            </Text>
          </Box>
        </Box>

        <Signin
          className={signinFormClassName}
          isDisplay={isDisplaySinginForm}
          slideTo={slideTo}
        />

        {isDisplaySignupForm && (
          <Signup
            className={signupFormClassName}
            isDisplay={isDisplaySignupForm}
            onSlideSignupFormToEmailVerificationView={
              slideSignupFormToEmailVerificationView
            }
            onBack={() =>
              onSlide("back", setSignupFormClassName, setIsDisplaySignupForm)
            }
          />
        )}

        {isDisplayEmailVerificationView && (
          <EmailVerification
            className={emailVerificationFormClassName}
            isDisplay={isDisplayEmailVerificationView}
            onBack={() =>
              onSlide(
                "back",
                setEmailVerificationFormClassName,
                setIsDisplayEmailVerificationView
              )
            }
          />
        )}
      </Flex>
    </CardViewDefault>
  )
}

export default memo(SigninPage)
