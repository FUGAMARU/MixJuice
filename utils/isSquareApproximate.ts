export const isSquareApproximate = (width: number, height: number) => {
  const aspectRatio = width / height
  const squareAspectRatio = 1

  const difference = Math.abs(aspectRatio - squareAspectRatio)

  const tolerance = 0.1 // しきい値
  return difference <= tolerance
}
