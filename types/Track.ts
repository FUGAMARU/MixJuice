import { Provider } from "./Provider"

export type Track = {
  id: string // SpotifyのトラックID、WebDAVのダウンロードリンク
  path?: string // WebDAVのファイルパス TODO: Spotifyでも使うようにして、必須項目にしたい
  provider: Provider
  title: string
  albumTitle: string
  artist: string
  imgSrc: string
  imgHeight: number
  imgWidth: number
  duration: number // 単位: ミリ秒
}
