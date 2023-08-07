import { ImageInfo } from "./ImageInfo"
import { Provider } from "./Provider"

/* expandTrackInfoにてジェネリクス型を使用している関係でtypeじゃなくてinterfaceで型定義 */
export interface Track {
  id: string // SpotifyのトラックID、WebDAVのダウンロードリンク
  provider: Provider
  title: string
  albumTitle: string
  artist: string
  image: ImageInfo | undefined
  duration: number // 単位: ミリ秒
}

export interface TrackWithPath extends Track {
  path: string
} // WebDAVのIndexedDB関連でのみ扱う型 | path: オーディオファイルの絶対パス
