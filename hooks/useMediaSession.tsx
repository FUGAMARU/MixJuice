import { useCallback, useEffect, useRef } from "react"
import { useSetRecoilState } from "recoil"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { Track } from "@/types/Track"
import { createSilentAudioBlob } from "@/utils/createSilentAudioBlob"

type Props = {
  initialize: boolean
  trackInfo: Track | undefined
  onTogglePlay: () => Promise<void>
  onNextTrack: () => void
}

const useMediaSession = ({
  initialize,
  trackInfo,
  onTogglePlay,
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

  useEffect(() => {
    ;(async () => {
      if (
        !("mediaSession" in navigator) ||
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

        navigator.mediaSession.playbackState = "playing"

        navigator.mediaSession.setActionHandler("play", async () => {
          console.log("PLAY!")
          await onTogglePlay()
          navigator.mediaSession.playbackState = "playing"
          return dummyAudioRef.current?.play()
        })
        navigator.mediaSession.setActionHandler("pause", async () => {
          await onTogglePlay()
          navigator.mediaSession.playbackState = "paused"
          console.log("PAUSE!")
          return dummyAudioRef.current?.pause()
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
      clearInterval(setMediaMetadatainterval.current)
      dummyAudioRef.current?.pause()
      dummyAudioRef.current?.remove()
      dummyAudioRef.current = undefined
    }
  }, [
    trackInfo,
    initialize,
    setErrorModalInstance,
    setMediaMetadata,
    onNextTrack,
    onTogglePlay
  ])
}

export default useMediaSession
