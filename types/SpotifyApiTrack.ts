export type SpotifyApiTrack = {
  track: {
    id: string
    name: string
    uri: string
    album: {
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
