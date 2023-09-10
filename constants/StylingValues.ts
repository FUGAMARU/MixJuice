import { MantineTransition } from "@mantine/core"

export const STYLING_VALUES = {
  /* Navbarのpadding (単位: px) */
  NAVBAR_PADDING: 15,

  /* キューのリスト上部のpadding (単位: px) */
  QUEUE_PADDING_TOP: 5,

  /* ヘッダーの高さ (単位: px) */
  HEADER_HEIGHT: 50,

  /** デフォルトのテキストカラー */
  TEXT_COLOR_DEFAULT: "#424242",

  /** iOSのテキストのカラーコードをコピーしたもの */
  TEXT_COLOR_BLUE: "#228be6",

  TOOLTIP_TRANSITION_PROPS: {
    TRANSITION: "fade" as MantineTransition,
    DURATION: 300
  }
}
