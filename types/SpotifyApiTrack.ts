export type SpotifyApiTrack = {
  track: {
    id: string
    duration_ms: number
    name: string
    uri: string
    album: {
      name: string
      images: {
        height: number
        width: number
        url: string
      }[]
    }
    artists: {
      name: string
    }[]
  }
}
