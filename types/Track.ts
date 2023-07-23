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
  duration: number // 単位: 秒
}
