import { useCallback, useEffect, useRef } from "react"
import useLogger from "./useLogger"
import { Track } from "@/types/Track"
import { createSilentAudioBlob } from "@/utils/createSilentAudioBlob"

type Props = {
  initialize: boolean
  trackInfo: Track | undefined
  playbackPosition: number
  isPlaying: boolean
  isPreparingPlayback: boolean
  hasNextTrack: boolean
  hasPreviousTrack: boolean
  onPause: () => Promise<void>
  onResume: () => Promise<void>
  onNextTrack: () => Promise<void>
  onPreviousTrack: () => Promise<void>
  onSeekTo: (position: number) => Promise<void>
}

const useMediaSession = ({
  initialize,
  trackInfo,
  playbackPosition,
  isPlaying,
  isPreparingPlayback,
  hasNextTrack,
  hasPreviousTrack,
  onPause,
  onResume,
  onNextTrack,
  onPreviousTrack,
  onSeekTo
}: Props) => {
  const showLog = useLogger()
  const dummyAudioRef = useRef<HTMLAudioElement>()

  const setMediaMetadata = useCallback((trackInfo: Track) => {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: trackInfo.title,
      artist: trackInfo.artist,
      album: trackInfo.albumTitle,
      artwork: trackInfo.image
        ? [
            {
              src: trackInfo.image.src,
              sizes: `${trackInfo.image.width}x${trackInfo.image.height}`
            }
          ]
        : undefined
    })
  }, [])

  const onPlayDummyAudio = useCallback(
    async (duration: number) => {
      try {
        const audioBlob = await createSilentAudioBlob(duration)
        showLog("success", "AudioBlobの生成が完了しました")
        showLog("none", audioBlob)

        const dummyAudio = new Audio(URL.createObjectURL(audioBlob))
        dummyAudioRef.current = dummyAudio
        dummyAudio.play()
        navigator.mediaSession.playbackState = "playing"
      } catch (e) {
        showLog("error", e)
        throw new Error(
          "AudioBlobの生成に失敗しました。Media Session APIは利用できません。"
        )
      }
    },
    [showLog]
  )

  const onPauseDummyAudio = useCallback(() => {
    dummyAudioRef.current?.pause()
    navigator.mediaSession.playbackState = "paused"
  }, [])

  const onResumeDummyAudio = useCallback(() => {
    dummyAudioRef.current?.play()
    navigator.mediaSession.playbackState = "playing"

    if (!trackInfo) return
    setMediaMetadata(trackInfo)
  }, [setMediaMetadata, trackInfo])

  const onDummyAudioSeekTo = useCallback(
    (position: number) => {
      // positionはミリ秒
      if (dummyAudioRef.current === undefined) return
      dummyAudioRef.current.currentTime = position / 1000 // ミリ秒を秒に変換する
    },
    [dummyAudioRef]
  )

  const clearDummyAudio = useCallback(() => {
    dummyAudioRef.current?.pause()
    dummyAudioRef.current?.remove()
    dummyAudioRef.current = undefined
  }, [])

  useEffect(() => {
    const duration = trackInfo === undefined ? 0 : trackInfo.duration / 1000 // Media Session APIのdurationは秒単位だが、Trackのdurationはミリ秒単位なので変換する
    const position = playbackPosition / 1000 // Media Session APIのpositionは秒単位だが、playbackPositionはミリ秒単位なので変換する
    if (position > duration) return // WebDAVのトラックが再生終了する瞬間一瞬だけpositionがdurationを超えることがある

    navigator.mediaSession.setPositionState({
      duration,
      playbackRate: 1,
      position
    })
  }, [playbackPosition, trackInfo])

  useEffect(() => {
    if (!isPlaying) {
      navigator.mediaSession.playbackState = "paused"
      return
    }

    navigator.mediaSession.playbackState = "playing"
  }, [isPlaying])

  useEffect(() => {
    ;(async () => {
      if (
        !(
          "mediaSession" in navigator &&
          "setPositionState" in navigator.mediaSession
        ) ||
        trackInfo === undefined ||
        !initialize
      )
        return

      setMediaMetadata(trackInfo)

      navigator.mediaSession.setActionHandler("play", async () => {
        await onResume()
        if (dummyAudioRef.current?.paused) await dummyAudioRef.current?.play()
        navigator.mediaSession.playbackState = "playing"
        return
      })

      navigator.mediaSession.setActionHandler("pause", async () => {
        await onPause()
        if (!dummyAudioRef.current?.paused) dummyAudioRef.current?.pause()
        navigator.mediaSession.playbackState = "paused"
        return
      })

      if (!isPreparingPlayback && trackInfo && hasNextTrack) {
        navigator.mediaSession.setActionHandler("nexttrack", () =>
          onNextTrack()
        )
      } else {
        navigator.mediaSession.setActionHandler("nexttrack", null)
      }

      if (!isPreparingPlayback && trackInfo && hasPreviousTrack) {
        navigator.mediaSession.setActionHandler("previoustrack", () =>
          onPreviousTrack()
        )
      } else {
        navigator.mediaSession.setActionHandler("previoustrack", null)
      }

      navigator.mediaSession.setActionHandler("seekto", async e => {
        const { seekTime } = e // seekTimeは秒単位
        if (seekTime === undefined) return
        await onSeekTo(seekTime * 1000) // ミリ秒に変換して渡す
      })
    })()
  }, [
    initialize,
    onNextTrack,
    onPreviousTrack,
    onPause,
    onResume,
    setMediaMetadata,
    trackInfo,
    onSeekTo,
    isPreparingPlayback,
    hasNextTrack,
    hasPreviousTrack
  ])

  return {
    onPlayDummyAudio,
    onDummyAudioSeekTo,
    clearDummyAudio,
    onPauseDummyAudio,
    onResumeDummyAudio
  } as const
}

export default useMediaSession
