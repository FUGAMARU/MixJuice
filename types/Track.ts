import { Provider } from "./Provider"

export type Track = {
  id: string // SpotifyのトラックID、WebDAVのダウンロードリンク
  provider: Provider
  title: string
  albumTitle: string
  artist: string
  imgSrc: string
  imgHeight: number
  imgWidth: number
  duration: number // 単位: ミリ秒
}

export type TrackWithPath = Track & { path: string } // WebDAVのIndexedDB関連でのみ扱う型 | path: オーディオファイルの絶対パス
