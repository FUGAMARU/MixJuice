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
import Image from "next/image"
import { memo, useCallback, useRef, useState } from "react"
import { HiOutlineMail } from "react-icons/hi"
import { PiPasswordBold } from "react-icons/pi"
import { useRecoilValue } from "recoil"
import { faviconIndexAtom } from "@/atoms/faviconIndexAtom"
import { STYLING_VALUES } from "@/constants/StylingValues"
import useAuth from "@/hooks/useAuth"
import useBreakPoints from "@/hooks/useBreakPoints"
import useTouchDevice from "@/hooks/useTouchDevice"
import styles from "@/styles/SigninPage.module.css"
import { greycliffCF } from "@/styles/fonts"

const SigninPage = () => {
  const { setRespVal } = useBreakPoints()
  const { isTouchDevice } = useTouchDevice()
  const faviconIndex = useRecoilValue(faviconIndexAtom)

  const { checkUserExists, signUp } = useAuth()

  const [authState, setAuthState] = useState<
    "NOT_SIGNIN" | "NOT_REGISTERED" | "EMAIL_NOT_VERIFIED" | "DONE"
  >("NOT_SIGNIN")

  const [isGoButtonLoading, setIsGoButtonLoading] = useState(false)

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

          try {
            // TODO: サインイン処理
            setAuthState("DONE")
          } catch {}
          break
        case "NOT_REGISTERED":
          try {
            await signUp(
              emailRef.current?.value ?? "",
              passwordRef.current?.value ?? ""
            )
            // TODO: Email認証してください的な表示
            setAuthState("EMAIL_NOT_VERIFIED")
          } catch {}
        case "EMAIL_NOT_VERIFIED":
          // TODO: メールアドレス認証メールを再送信用ボタンのマークアップとそれを出現させる処理
          // TODO: この状態では、認証メールの再送信ボタンと、認証が済んだかのチェック用ボタンの2つが表示される
          // TODO: 認証が済んだかボタンを押下して、無事に認証が済んでいたら、DONEに遷移する
          break
      }
    } finally {
      setIsGoButtonLoading(false)
    }
  }, [authState, checkUserExists, signUp])

  return (
    <Center h="100%">
      <Box
        h="20rem"
        w={setRespVal("85%", "25rem", "25rem")}
        px="xl"
        py="md"
        bg="white"
        ta="center"
        sx={{
          borderTopLeftRadius: "5px",
          borderBottomLeftRadius: "5px",
          overflow: "hidden"
        }}
      >
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
            <Text fz={setRespVal("0.7rem", "0.8rem", "0.8rem")}>
              サービスを利用するにはサインインが必要です
            </Text>
          </Stack>

          <Divider mt="sm" mb="xl" variant="dotted" />

          <Stack spacing="md">
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
              className={authState === "NOT_REGISTERED" ? styles.slideIn : ""}
              sx={{
                display: authState === "NOT_REGISTERED" ? "block" : "none"
              }}
            >
              <Flex
                w="100%"
                className="animate__animated animate__fadeIn"
                sx={{ animationDelay: ".5s" }}
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
        </Flex>
      </Box>
    </Center>
  )
}

export default memo(SigninPage)
