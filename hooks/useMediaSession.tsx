import { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { Track } from "@/types/Track"
import { createSilentAudioBlob } from "@/utils/createSilentAudioBlob"

type Props = {
  initialize: boolean
  trackInfo: Track | undefined
}

const useMediaSession = ({ initialize, trackInfo }: Props) => {
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)

  useEffect(() => {
    ;(async () => {
      if ("mediaSession" in navigator && trackInfo && initialize) {
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

        navigator.mediaSession.setActionHandler("play", () => {
          console.log("PLAY!")
        })
        navigator.mediaSession.setActionHandler("pause", () => {
          console.log("PAUSE!")
        })

        try {
          const audioBlob = await createSilentAudioBlob(trackInfo.duration)
          console.log("🟩DEBUG: AudioBlobの生成が完了しました")
          console.log(audioBlob)
          const dummyAudio = new Audio(URL.createObjectURL(audioBlob))
          dummyAudio.play()
        } catch (e) {
          console.log("🟥ERROR: ", e)
          setErrorModalInstance(prev => [
            ...prev,
            new Error(
              "AudioBlobの生成に失敗しました。Media Session APIは利用できません。"
            )
          ])
        }
      }
    })()
  }, [trackInfo, initialize, setErrorModalInstance])
}

export default useMediaSession
