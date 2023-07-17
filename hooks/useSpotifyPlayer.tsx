import { useCallback, useEffect, useMemo, useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import useSpotifyApi from "./useSpotifyApi"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { spotifyAccessTokenAtom } from "@/atoms/spotifyAccessTokenAtom"

type Props = {
  onTrackFinish: () => void
}

const useSpotifyPlayer = ({ onTrackFinish }: Props) => {
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const accessToken = useRecoilValue(spotifyAccessTokenAtom)
  const [player, setPlayer] = useState<Spotify.Player>()
  const [playbackState, setPlaybackState] = useState<Spotify.PlaybackState>()
  const { startPlayback } = useSpotifyApi()

  const playbackPosition = useMemo(() => {
    if (playbackState === undefined) return 0
    return (playbackState.position / playbackState.duration) * 100
  }, [playbackState])

  const onSpotifyPlay = useCallback(
    async (trackId: string) => {
      while (sessionStorage.getItem("deviceId") === null) {
        console.log("🟦DEBUG: デバイスIDの取得完了を待機しています…")
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      try {
        await startPlayback(
          sessionStorage.getItem("deviceId") as string, // 上記のwhile文によりsessionStorageのdeviceIdがnullでないことが保証されている
          trackId
        )
      } catch (e) {
        setErrorModalInstance(prev => [...prev, e])
      }
    },
    [startPlayback, setErrorModalInstance]
  )

  /** Web Playback SDK */
  useEffect(() => {
    if (accessToken === undefined || player) return

    const script = document.createElement("script")
    script.src = "https://sdk.scdn.co/spotify-player.js"
    script.async = true

    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "MixJuice",
        getOAuthToken: callback => {
          callback(accessToken.token)
        },
        volume: 0.5
      })

      setPlayer(player)

      player.addListener("ready", ({ device_id }) => {
        console.log("🟩DEBUG: Spotify WebPlaybackSDKの準備が完了しました")
        sessionStorage.setItem("deviceId", device_id)
      })

      player.addListener("not_ready", ({ device_id }) => {
        console.log("🟧DEBUG: Spotify WebPlaybackSDKがNot Readyになりました")
        sessionStorage.setItem("deviceId", device_id)
      })

      player.addListener("player_state_changed", ({ position, duration }) => {
        if (position === duration) onTrackFinish()
      })

      setInterval(async () => {
        const state = await player.getCurrentState()
        if (state === null) return

        setPlaybackState(state)
      }, 100)

      player.connect()
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [accessToken, onTrackFinish, player])

  return { playbackPosition, onSpotifyPlay } as const
}

export default useSpotifyPlayer
