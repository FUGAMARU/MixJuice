"use client"

import { MantineProvider } from "@mantine/core"

type Props = {
  children: React.ReactNode
}

const MantineUI: React.FC<Props> = ({ children }) => {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        components: {
          Box: {
            defaultProps: {
              color: "#424242"
            }
          },
          Flex: {
            defaultProps: {
              color: "#424242"
            }
          },
          Text: {
            defaultProps: {
              color: "#424242"
            }
          },
          Title: {
            defaultProps: {
              color: "#424242"
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
          ]
        },
        colorScheme: "light",
        fontFamily: "NotoSansJP, GreycliffCF, Kazesawa"
      }}
    >
      {children}
    </MantineProvider>
  )
}

export default MantineUI
