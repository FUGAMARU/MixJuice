import { SettingValues, SettingItems } from "@/types/DefaultSettings"

export const SETTING_ITEMS: SettingItems = {
  VERSION: {
    label: "バージョン",
    description: "バージョン"
  },
  THEME: {
    label: "テーマ",
    description: "TODO: 未実装",
    options: ["system", "light", "dark"]
  },
  CLOSE_MODAL_AUTOMATICALLY_WHEN_TRACK_SELECTED: {
    label: "モーダルのオートクローズを有効にする",
    description:
      "モーダルからトラックを再生開始した時に自動的にモーダルを閉じるかどうか"
  },
  REMOVE_DUPLICATES_ON_MIX: {
    label: "MIX時の楽曲の重複除去を有効にする",
    description:
      "複数プレイリストに同一楽曲が存在する場合などにMIX時に重複を除去するかどうか"
  },
  HIDE_TOOLTIP: {
    label: "ツールチップを非表示にする",
    description:
      "要素をホバーした時に表示されるツールチップを非表示にするかどうか"
  },
  SEARCH_ALL_METADATA_FOR_UNCACHED_WEBDAV_TRACK: {
    label: "WebDAVの未キャッシュ楽曲の詳細検索を有効にする",
    description:
      "WebDAVサーバー上にある楽曲を検索する時、ファイル名ではなくメタデータを対象に検索するかどうか"
  },
  DEBUGMODE: {
    label: "デバッグモードを有効にする",
    description: "デバッグモードを有効にするかどうか"
  },
  BACKGROUND_OF_QUEUE: {
    label: "キューの背景",
    description: "そのうち選択肢が増えるかも…？",
    options: ["vercel", "meta"]
  }
} as const

export const DEFAULT_SETTING_VALUES: SettingValues = {
  VERSION: 1,
  THEME: "system", //TODO: 未実装
  CLOSE_MODAL_AUTOMATICALLY_WHEN_TRACK_SELECTED: false,
  REMOVE_DUPLICATES_ON_MIX: false,
  HIDE_TOOLTIP: false,
  SEARCH_ALL_METADATA_FOR_UNCACHED_WEBDAV_TRACK: false,
  DEBUGMODE: false,
  BACKGROUND_OF_QUEUE: "vercel"
} as const
