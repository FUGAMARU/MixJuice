import "@/styles/globals.css"
import "animate.css"
import Curtain from "./components/layout/Curtain"
import VercelShape from "./components/layout/VercelShape"
import MantineUI from "./components/layout/providers/MantineUI"
import Recoil from "./components/layout/providers/Recoil"
import SpotifyDaemon from "./components/layout/providers/SpotifyDaemon"
import CustomFonts from "@/app/components/layout/CustomFonts"

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

export default RootLayout
