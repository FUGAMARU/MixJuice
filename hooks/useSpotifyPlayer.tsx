import { useCallback } from "react"
import { useSetRecoilState } from "recoil"
import useSpotifyApi from "./useSpotifyApi"
import useSpotifyWebPlaybackSDK from "./useSpotifyWebPlaybackSDK"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"

const useSpotifyPlayer = () => {
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const { startPlayback } = useSpotifyApi()
  useSpotifyWebPlaybackSDK()

  const onSpotifyPlay = useCallback(
    async (trackId: string) => {
      while (sessionStorage.getItem("deviceId") === null) {
        console.log("🟦DEBUG: デバイスIDの取得を待機しています…")
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

  return { onSpotifyPlay } as const
}

export default useSpotifyPlayer
