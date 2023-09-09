export const millisecondsToTimeString = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000)

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`

  const timeString = `${minutes}:${formattedSeconds}`
  return timeString
}
