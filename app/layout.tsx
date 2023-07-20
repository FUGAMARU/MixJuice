import "@/styles/globals.css"
import "animate.css"
import { memo } from "react"
import Curtain from "@/components/layout/Curtain"
import CustomFonts from "@/components/layout/CustomFonts"
import VercelShape from "@/components/layout/VercelShape"
import MantineUI from "@/components/layout/providers/MantineUI"
import Recoil from "@/components/layout/providers/Recoil"
import SpotifyDaemon from "@/components/layout/providers/SpotifyDaemon"

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <head>
        <title>MixJuice</title>
        <link rel="icon" href="/favicon.ico" />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Integrated music playback environment with Spotify and WebDAV servers as resources."
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicons/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <link rel="shortcut icon" href="/favicons/favicon.ico" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta
          name="msapplication-config"
          content="/favicons/browserconfig.xml"
        />
        <meta name="theme-color" content="#ffffff" />
      </head>

      <body>
        <Recoil>
          <MantineUI>
            <SpotifyDaemon>
              <CustomFonts />
              {/** 背景 */}
              <VercelShape />

              <Curtain>{children}</Curtain>
            </SpotifyDaemon>
          </MantineUI>
        </Recoil>
      </body>
    </html>
  )
}

export default memo(RootLayout)
