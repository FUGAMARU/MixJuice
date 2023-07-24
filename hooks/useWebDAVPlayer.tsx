import { useCallback, useEffect, useRef, useState } from "react"
import { Track } from "@/types/Track"

type Props = {
  currentTrackInfo: Track | undefined
  onTrackFinish: () => void
}

const useWebDAVPlayer = ({ currentTrackInfo, onTrackFinish }: Props) => {
  const audio = useRef<HTMLAudioElement>()
  const [playbackPosition, setPlaybackPosition] = useState(0)

  const onPlay = useCallback(
    async (url: string) => {
      if (audio.current === undefined) return

      audio.current.src = url
      await audio.current.play()
    },
    [audio]
  )

  const onPause = useCallback(() => {
    if (audio.current === undefined) return
    audio.current.pause()
  }, [])

  const onResume = useCallback(async () => {
    if (audio.current === undefined) return
    await audio.current.play()
  }, [])

  const handleTrackFinish = useCallback(() => {
    onTrackFinish()
  }, [onTrackFinish])

  useEffect(() => {
    audio.current = new Audio()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (audio.current === undefined || currentTrackInfo === undefined) {
        setPlaybackPosition(0)
        return
      }
      setPlaybackPosition(audio.current.currentTime * 1000)
    }, 100)

    return () => clearInterval(interval)
  }, [currentTrackInfo])

  useEffect(() => {
    if (audio.current === undefined) return

    audio.current.addEventListener("ended", handleTrackFinish)

    return () => {
      audio.current?.removeEventListener("ended", handleTrackFinish)
    }
  }, [handleTrackFinish])

  return { onPlay, onPause, onResume, playbackPosition } as const
}

export default useWebDAVPlayer
