import { Global } from "@mantine/core"
import React from "react"

const CustomFonts: React.FC = () => {
  return (
    <Global
      styles={[
        {
          "@font-face": {
            fontFamily: "Kazesawa",
            src: "url(/fonts/Kazesawa-Light.woff2)",
            fontWeight: 300,
            fontStyle: "normal"
          }
        },
        {
          "@font-face": {
            fontFamily: "Kazesawa",
            src: "url(/fonts/Kazesawa-Regular.woff2)",
            fontWeight: 400,
            fontStyle: "normal"
          }
        },
        {
          "@font-face": {
            fontFamily: "Kazesawa",
            src: "url(/fonts/Kazesawa-Semibold.woff2)",
            fontWeight: 600,
            fontStyle: "normal"
          }
        },
        {
          "@font-face": {
            fontFamily: "Kazesawa",
            src: "url(/fonts/Kazesawa-Bold.woff2)",
            fontWeight: 700,
            fontStyle: "normal"
          }
        },
        {
          "@font-face": {
            fontFamily: "Kazesawa",
            src: "url(/fonts/Kazesawa-Extrabold.woff2)",
            fontWeight: 800,
            fontStyle: "normal"
          }
        },
        {
          "@font-face": {
            fontFamily: "GreycliffCF",
            src: "url(/fonts/GreycliffCF-Light.woff2)",
            fontWeight: 300,
            fontStyle: "normal"
          }
        },
        {
          "@font-face": {
            fontFamily: "GreycliffCF",
            src: "url(/fonts/GreycliffCF-Regular.woff2)",
            fontWeight: 400,
            fontStyle: "normal"
          }
        },
        {
          "@font-face": {
            fontFamily: "GreycliffCF",
            src: "url(/fonts/GreycliffCF-Medium.woff2)",
            fontWeight: 500,
            fontStyle: "normal"
          }
        },
        {
          "@font-face": {
            fontFamily: "GreycliffCF",
            src: "url(/fonts/GreycliffCF-DemiBold.woff2)",
            fontWeight: 600,
            fontStyle: "normal"
          }
        },
        {
          "@font-face": {
            fontFamily: "GreycliffCF",
            src: "url(/fonts/GreycliffCF-Bold.woff2)",
            fontWeight: 700,
            fontStyle: "normal"
          }
        },
        {
          "@font-face": {
            fontFamily: "GreycliffCF",
            src: "url(/fonts/GreycliffCF-ExtraBold.woff2)",
            fontWeight: 800,
            fontStyle: "normal"
          }
        },
        {
          "@font-face": {
            fontFamily: "GreycliffCF",
            src: "url(/fonts/GreycliffCF-Heavy.woff2)",
            fontWeight: 900,
            fontStyle: "normal"
          }
        }
      ]}
    />
  )
}

export default CustomFonts
