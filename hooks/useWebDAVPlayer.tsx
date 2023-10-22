import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react"
import { Track } from "@/types/Track"
import { isDefined } from "@/utils/isDefined"

type Props = {
  currentTrackInfo: Track | undefined
  volume: number
  setIsPreparingPlayback: Dispatch<SetStateAction<boolean>>
  onTrackFinish: () => void
}

const useWebDAVPlayer = ({
  currentTrackInfo,
  volume,
  setIsPreparingPlayback,
  onTrackFinish
}: Props) => {
  const audio = useRef<HTMLAudioElement>()
  const [playbackPosition, setPlaybackPosition] = useState(0)

  const onPlay = useCallback(
    async (url: string) => {
      if (!isDefined(audio.current)) return

      audio.current.src = url
      await audio.current.play()
      setIsPreparingPlayback(false)
    },
    [audio, setIsPreparingPlayback]
  )

  const onPause = useCallback(() => {
    if (!isDefined(audio.current)) return
    audio.current.pause()
  }, [])

  const onResume = useCallback(async () => {
    if (!isDefined(audio.current)) return
    await audio.current.play()
  }, [])

  const onSeekTo = useCallback((position: number) => {
    // positionはミリ秒
    if (!isDefined(audio.current)) return
    audio.current.currentTime = position / 1000 // ミリ秒を秒に変換する
  }, [])

  const handleTrackFinish = useCallback(() => {
    onTrackFinish()
  }, [onTrackFinish])

  useEffect(() => {
    audio.current = new Audio()
  }, [])

  /** 再生位置の更新 */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDefined(audio.current) || !isDefined(currentTrackInfo)) {
        setPlaybackPosition(0)
        return
      }
      setPlaybackPosition(audio.current.currentTime * 1000)
    }, 100)

    return () => clearInterval(interval)
  }, [currentTrackInfo])

  /** 再生終了イベントハンドラー */
  useEffect(() => {
    if (!isDefined(audio.current)) return

    audio.current.addEventListener("ended", handleTrackFinish)

    return () => {
      audio.current?.removeEventListener("ended", handleTrackFinish)
    }
  }, [handleTrackFinish])

  /** 音量の値をプレイヤーと同期させる */
  useEffect(() => {
    if (!isDefined(audio.current)) return
    audio.current.volume = volume / 100
  }, [volume])

  return { onPlay, onPause, onResume, onSeekTo, playbackPosition } as const
}

export default useWebDAVPlayer
