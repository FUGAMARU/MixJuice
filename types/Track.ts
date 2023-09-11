import { ImageInfo } from "./ImageInfo"
import { Provider } from "./Provider"
import { SpotifyTrack } from "./SpotifyApiResponse"

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

export const formatFromSpotifyTrack = (spotifyTrack: SpotifyTrack): Track => {
  return {
    id: spotifyTrack.id,
    provider: "spotify" as Provider,
    title: spotifyTrack.name,
    albumTitle: spotifyTrack.album.name,
    artist: spotifyTrack.artists.map(artist => artist.name).join("・"),
    image: {
      src: spotifyTrack.album.images[0].url,
      height: spotifyTrack.album.images[0].height,
      width: spotifyTrack.album.images[0].width
    },
    duration: spotifyTrack.duration_ms
  }
}

export const removePathProperty = (trackWithPath: TrackWithPath): Track => {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { path, ...trackWithoutPath } = trackWithPath
  return trackWithoutPath
}
