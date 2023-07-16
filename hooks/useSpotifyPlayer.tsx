import { useCallback, useEffect, useState } from "react"
import { useSetRecoilState } from "recoil"
import useSpotifyApi from "./useSpotifyApi"
import useSpotifyWebPlaybackSDK from "./useSpotifyWebPlaybackSDK"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"

type Props = {
  onTrackFinish: () => void
}

const useSpotifyPlayer = ({ onTrackFinish }: Props) => {
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const [playbackPosition, setPlaybackPosition] = useState(0) // 再生位置 | 単位: %
  const { startPlayback } = useSpotifyApi()
  const { playbackState } = useSpotifyWebPlaybackSDK({ onTrackFinish })

  useEffect(() => {
    if (playbackState === undefined) return

    const percentage = (playbackState.position / playbackState.duration) * 100
    setPlaybackPosition(percentage)
  }, [playbackState, setPlaybackPosition, onTrackFinish])

  const onSpotifyPlay = useCallback(
    async (trackId: string) => {
      while (sessionStorage.getItem("deviceId") === null) {
        console.log("🟦DEBUG: デバイスIDの取得完了を待機しています…")
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      try {
        startPlayback(sessionStorage.getItem("deviceId") as string, trackId) // 上記のwhile文によりsessionStorageのdeviceIdがnullでないことが保証されている
      } catch (e) {
        setErrorModalInstance(prev => [...prev, e])
      }
    },
    [startPlayback, setErrorModalInstance]
  )

  return { playbackPosition, onSpotifyPlay } as const
}

export default useSpotifyPlayer
