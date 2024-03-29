"use client"

import { MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { memo } from "react"
import { STYLING_VALUES } from "@/constants/StylingValues"
import { greycliffCF, notoSansJP } from "@/styles/fonts"
import { Children } from "@/types/Children"

const MantineUI = ({ children }: Children) => {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        components: {
          Box: {
            defaultProps: {
              color: STYLING_VALUES.TEXT_COLOR_DEFAULT
            }
          },
          Flex: {
            defaultProps: {
              color: STYLING_VALUES.TEXT_COLOR_DEFAULT
            }
          },
          Text: {
            defaultProps: {
              color: STYLING_VALUES.TEXT_COLOR_DEFAULT
            }
          },
          Title: {
            defaultProps: {
              color: STYLING_VALUES.TEXT_COLOR_DEFAULT
            }
          },
          Paper: {
            defaultProps: {
              color: STYLING_VALUES.TEXT_COLOR_DEFAULT
            }
          }
        },
        colors: {
          spotify: [
            "#E8FCF0",
            "#BFF8D4",
            "#95F3B9",
            "#6CEF9D",
            "#43EA82",
            "#19E666",
            "#14B852",
            "#0F8A3D",
            "#0A5C29",
            "#052E14"
          ],
          webdav: [
            "#E6F6FF",
            "#B9E7FE",
            "#8BD7FD",
            "#5EC7FD",
            "#31B8FC",
            "#04A8FB",
            "#0386C9",
            "#026597",
            "#014365",
            "#012232"
          ]
        },
        colorScheme: "light",
        fontFamily: `${notoSansJP.style.fontFamily}, ${greycliffCF.style.fontFamily}, sans-serif`,
        respectReducedMotion: false
      }}
    >
      <Notifications />
      {children}
    </MantineProvider>
  )
}

export default memo(MantineUI)
