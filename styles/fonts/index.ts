import { Noto_Sans_JP } from "next/font/google"
import localfont from "next/font/local"

export const notoSansJP = Noto_Sans_JP({
  display: "swap",
  style: "normal",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  preload: false,
  variable: "--font-noto-sans-jp"
})

export const greycliffCF = localfont({
  display: "swap",
  src: [
    { path: "GreycliffCF-Light.woff2", weight: "300", style: "normal" },
    { path: "GreycliffCF-Regular.woff2", weight: "400", style: "normal" },
    { path: "GreycliffCF-Medium.woff2", weight: "500", style: "normal" },
    { path: "GreycliffCF-Demibold.woff2", weight: "600", style: "normal" },
    { path: "GreycliffCF-Bold.woff2", weight: "700", style: "normal" },
    { path: "GreycliffCF-Extrabold.woff2", weight: "800", style: "normal" }
  ],
  variable: "--font-greycliff-cf"
})

export const seanbeckerExtraboldItalic = localfont({
  display: "swap",
  src: "seanbecker-extrabold-italic.woff2",
  variable: "--font-seanbecker-extrabold-italic"
})
