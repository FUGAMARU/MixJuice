export const getMimeType = (filename: string) => {
  if (filename.endsWith(".mp3")) return "audio/mpeg"
  if (filename.endsWith(".m4a")) return "audio/mp4"
  if (filename.endsWith(".flac")) return "audio/flac"
  if (filename.endsWith(".wav")) return "audio/wav"
}
