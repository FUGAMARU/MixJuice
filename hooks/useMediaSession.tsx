import { useCallback, useEffect, useRef } from "react"
import { useSetRecoilState } from "recoil"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { Track } from "@/types/Track"
import { createSilentAudioBlob } from "@/utils/createSilentAudioBlob"

type Props = {
  initialize: boolean
  trackInfo: Track | undefined
  playbackPosition: number
  onPause: () => Promise<void>
  onResume: () => Promise<void>
  onNextTrack: () => void
}

const useMediaSession = ({
  initialize,
  trackInfo,
  playbackPosition,
  onPause,
  onResume,
  onNextTrack
}: Props) => {
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const setMediaMetadatainterval = useRef<NodeJS.Timer>()
  const dummyAudioRef = useRef<HTMLAudioElement>()

  const setMediaMetadata = useCallback((trackInfo: Track) => {
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: trackInfo.title,
      artist: trackInfo.artist,
      album: trackInfo.albumTitle,
      artwork: trackInfo.imgSrc
        ? [
            {
              src: trackInfo.imgSrc,
              sizes: `${trackInfo.imgWidth}x${trackInfo.imgHeight}`
            }
          ]
        : undefined
    })
  }, [])

  const handleResume = useCallback(async () => {
    await onResume()
    await dummyAudioRef.current?.play()
    navigator.mediaSession.playbackState = "playing"
  }, [onResume])

  const handlePause = useCallback(async () => {
    await onPause()
    await dummyAudioRef.current?.pause()
    navigator.mediaSession.playbackState = "paused"
  }, [onPause])

  const clearMediaSession = useCallback(() => {
    clearInterval(setMediaMetadatainterval.current)
    dummyAudioRef.current?.pause()
    dummyAudioRef.current?.remove()
    dummyAudioRef.current = undefined
  }, [])

  useEffect(() => {
    navigator.mediaSession.setPositionState({
      duration: trackInfo?.duration || 0,
      playbackRate: 1,
      position: playbackPosition
    })
  }, [playbackPosition, trackInfo])

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

      try {
        const audioBlob = await createSilentAudioBlob(trackInfo.duration)
        console.log("🟩DEBUG: AudioBlobの生成が完了しました")
        console.log(audioBlob)
        const dummyAudio = new Audio(URL.createObjectURL(audioBlob))
        dummyAudioRef.current = dummyAudio
        await dummyAudio.play()

        /** Spotifyの再生開始後にメタデーターをセットしないとデーターが反映されない(特にmacOS。ChromeのMedia Hubは問題なかった。)っぽいため、一定間隔でメタデーターをセットする
         * → 「Spotifyの再生開始後」というタイミングを取るのが難しい。トライしてみたけど難しかった。
         */
        clearInterval(setMediaMetadatainterval.current)
        setMediaMetadatainterval.current = setInterval(() => {
          setMediaMetadata(trackInfo)
        }, 500)

        navigator.mediaSession.setActionHandler("play", async () => {
          await handleResume()
          return
        })
        navigator.mediaSession.setActionHandler("pause", async () => {
          await handlePause()
          return
        })
        navigator.mediaSession.setActionHandler("nexttrack", () =>
          onNextTrack()
        )
      } catch (e) {
        console.log("🟥ERROR: ", e)
        setErrorModalInstance(prev => [
          ...prev,
          new Error(
            "AudioBlobの生成に失敗しました。Media Session APIは利用できません。"
          )
        ])
      }
    })()

    return () => {
      clearMediaSession()
    }
  }, [
    handlePause,
    handleResume,
    onNextTrack,
    setErrorModalInstance,
    setMediaMetadata,
    trackInfo,
    initialize,
    clearMediaSession
  ])

  return {
    onMediaSessionResume: handleResume,
    onMediaSessionPause: handlePause,
    clearMediaSession
  } as const
}

export default useMediaSession