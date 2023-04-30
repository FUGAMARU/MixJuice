import "@/styles/globals.css"
import { MantineProvider } from "@mantine/core"
import type { AppProps } from "next/app"
import CustomFonts from "@/components/CustomFonts"

export default function App({ Component, pageProps }: AppProps) {
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
        colorScheme: "light",
        fontFamily: "GreycliffCF, Kazesawa"
      }}
    >
      <CustomFonts />
      <Component {...pageProps} />
    </MantineProvider>
  )
}
