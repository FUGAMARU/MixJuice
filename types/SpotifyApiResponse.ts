export type SpotifyTrack = {
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

export type SpotifyApiPlaylistTracksResponse = {
  items: {
    track: SpotifyTrack
  }[]
  next: string | null
}

export type SpotifyApiTrackSearchResponse = {
  tracks: {
    items: SpotifyTrack[]
    href: string
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
  }
}
