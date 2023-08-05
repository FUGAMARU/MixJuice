export const extractOffsetValue = (url: string): number => {
  const regex = /offset=(\d+)/
  const match = url.match(regex)

  if (match && match[1]) {
    const offsetValue = parseInt(match[1], 10)
    return isNaN(offsetValue) ? 0 : offsetValue
  }

  return 0
}
