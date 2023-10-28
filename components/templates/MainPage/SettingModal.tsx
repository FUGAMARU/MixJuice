import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Select,
  Stack,
  Switch,
  Text
} from "@mantine/core"
import { useLocalStorage } from "@mantine/hooks"
import { memo, useMemo } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { IoSettingsOutline } from "react-icons/io5"
import { PiUserCircleThin } from "react-icons/pi"
import ModalDefault from "@/components/parts/ModalDefault"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { DEFAULT_SETTING_VALUES, SETTING_ITEMS } from "@/constants/Settings"
import useBreakPoints from "@/hooks/useBreakPoints"
import { SettingValues } from "@/types/DefaultSettings"
import { auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const SettingModal = ({ isOpen, onClose }: Props) => {
  const { breakPoint, setRespVal } = useBreakPoints()
  const [userInfo] = useAuthState(auth)
  const [settings, setSettings] = useLocalStorage<SettingValues>({
    key: LOCAL_STORAGE_KEYS.SETTINGS,
    defaultValue: DEFAULT_SETTING_VALUES
  })

  const footerFunctions = useMemo(() => {
    if (breakPoint === "SmartPhone") {
      return (
        <Stack spacing="xs">
          <Group spacing="xs" sx={{ justifyContent: "center" }} grow>
            <Button size="xs" variant="outline" color="gray">
              メールアドレス変更
            </Button>
            <Button size="xs" variant="outline" color="gray">
              パスワード変更
            </Button>
          </Group>
          <Group spacing="xs" sx={{ justifyContent: "center" }} grow>
            <Button size="xs" variant="outline" color="gray">
              アカウント削除
            </Button>
            <Button size="xs" variant="outline" color="gray">
              キャッシュ削除
            </Button>
          </Group>
        </Stack>
      )
    }

    return (
      <Group spacing="xs" sx={{ justifyContent: "center" }} grow>
        <Button size="xs" variant="outline" color="gray">
          メールアドレス変更
        </Button>
        <Button size="xs" variant="outline" color="gray">
          パスワード変更
        </Button>
        <Button size="xs" variant="outline" color="gray">
          アカウント削除
        </Button>
        <Button size="xs" variant="outline" color="gray">
          キャッシュ削除
        </Button>
      </Group>
    )
  }, [breakPoint])

  return (
    <ModalDefault
      title={
        <Flex align="center" gap="xs">
          <IoSettingsOutline />
          <Text>一般設定</Text>
        </Flex>
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <Flex align="center" justify="space-between">
        <Group spacing="0.3rem">
          <PiUserCircleThin size="2.5rem" />
          <Text
            maw="27rem"
            fw={700}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {userInfo?.email}
          </Text>
        </Group>

        <Button variant="outline" size="xs">
          サインアウト
        </Button>
      </Flex>

      <Divider my="sm" />

      <Stack spacing="md">
        {Object.entries(SETTING_ITEMS)
          .filter(
            ([key]) =>
              !["VERSION", "THEME", "BACKGROUND_OF_QUEUE"].includes(key)
          ) // TODO: テーマやキューの背景の実装が完了したら解放する
          .map(([key, val]) => (
            <Flex
              key={key}
              px={setRespVal("xs", "lg", "lg")}
              align="center"
              justify="space-between"
            >
              <Box>
                <Text fw={700}>{val.label}</Text>
                <Text fz="0.8rem" color="#868e96">
                  {val.description}
                </Text>
              </Box>
              {isDefined(val.options) ? (
                <Select data={val.options} defaultValue="vercel" />
              ) : (
                <Switch
                  defaultChecked={
                    settings[key as keyof SettingValues] as boolean // val.optionsが存在しなければboolean型であることが保証されている
                  }
                  onChange={e => {
                    setSettings({
                      ...settings,
                      [key as keyof SettingValues]: e.currentTarget.checked
                    })
                  }}
                  styles={{ track: { cursor: "pointer" } }}
                />
              )}
            </Flex>
          ))}
      </Stack>

      <Divider my="sm" />

      <Box ta="center">
        {footerFunctions}

        <Text fz="0.7rem" color="#868e96">
          ※完了後サインアウトされます
        </Text>
      </Box>
    </ModalDefault>
  )
}

export default memo(SettingModal)
