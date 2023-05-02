import "@/styles/globals.css"
import { MantineProvider } from "@mantine/core"
import type { AppProps } from "next/app"
import { RecoilRoot } from "recoil"
import CustomFonts from "@/components/CustomFonts"
import "animate.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
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
          // Todo: Retinaディスプレイで見るとKazesawaがRegularでもちょい細いので不格好 → Noto Sans に統一する？
          fontFamily: "GreycliffCF, Kazesawa"
        }}
      >
        <CustomFonts />
        <Component {...pageProps} />
      </MantineProvider>
    </RecoilRoot>
  )
}
