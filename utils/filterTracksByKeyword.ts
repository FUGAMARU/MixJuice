import { TrackWithPath } from "@/types/Track"

export const filterTracksByKeyword = (
  tracks: TrackWithPath[],
  keyword: string
) => {
  const lowerKeyword = keyword.toLowerCase()

  return tracks.filter(
    track =>
      track.path.toLowerCase().includes(lowerKeyword) ||
      track.title.toLowerCase().includes(lowerKeyword) ||
      track.albumTitle.toLowerCase().includes(lowerKeyword) ||
      track.artist.toLowerCase().includes(lowerKeyword)
  )
}
