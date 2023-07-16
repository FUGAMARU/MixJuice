import { useEffect } from "react"
import { useRecoilValue } from "recoil"
import { spotifyAccessTokenAtom } from "@/atoms/spotifyAccessTokenAtom"

const useSpotifyWebPlaybackSDK = () => {
  const accessToken = useRecoilValue(spotifyAccessTokenAtom)
  //const [player, setPlayer] = useState<Spotify.Player>()

  useEffect(() => {
    sessionStorage.clear()
  }, [])

  useEffect(() => {
    if (accessToken === undefined) return

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

      //setPlayer(player)

      player.addListener("ready", ({ device_id }) => {
        console.log("🟩DEBUG: Spotify WebPlaybackSDKの準備が完了しました")
        sessionStorage.setItem("deviceId", device_id)
      })

      player.addListener("not_ready", ({ device_id }) => {
        console.log("🟧DEBUG: Spotify WebPlaybackSDKがNot Readyになりました")
        sessionStorage.setItem("deviceId", device_id)
      })

      player.connect()
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [accessToken])

  return null
}

export default useSpotifyWebPlaybackSDK
