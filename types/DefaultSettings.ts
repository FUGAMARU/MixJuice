export type SettingValues = {
  VERSION: number
  THEME: "system" | "light" | "dark"
  CLOSE_MODAL_AUTOMATICALLY_WHEN_TRACK_SELECTED: boolean
  REMOVE_DUPLICATES_ON_MIX: boolean
  DEBUGMODE: boolean
  HIDE_TOOLTIP: boolean
  BACKGROUND_OF_QUEUE: "vercel" | "meta"
  SEARCH_ALL_METADATA_FOR_UNCACHED_WEBDAV_TRACK: boolean
}

type SettingItemDefinition = {
  label: string
  description: string
  options?: readonly string[]
}

export type SettingItems = Record<keyof SettingValues, SettingItemDefinition>
