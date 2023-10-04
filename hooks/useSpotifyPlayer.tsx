import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { useRecoilCallback, useRecoilValue } from "recoil"
import useSpotifyApi from "./useSpotifyApi"
import { spotifyAccessTokenAtom } from "@/atoms/spotifyAccessTokenAtom"

type Props = {
  initialize: boolean
  setIsPreparingPlayback: Dispatch<SetStateAction<boolean>>
  onTrackFinish: () => void
}

let calledTrackFinishCallback = false

const useSpotifyPlayer = ({
  initialize,
  setIsPreparingPlayback,
  onTrackFinish
}: Props) => {
  const accessToken = useRecoilValue(spotifyAccessTokenAtom)
  const [player, setPlayer] = useState<Spotify.Player>()
  const [playbackState, setPlaybackState] = useState<Spotify.PlaybackState>()
  const { startPlayback } = useSpotifyApi({ initialize: false })
  const deviceId = useRef("")
  const [playbackQuality, setPlaybackQuality] = useState<string>() // string: Spotifyの再生音質 | undefined: Spotify以外の楽曲を再生している時

  const playbackPosition = useMemo(() => {
    if (playbackState === undefined) return 0
    return playbackState.position
  }, [playbackState])

  const onPlay = useCallback(
    async (trackId: string) => {
      while (deviceId.current === "") {
        console.log("🟦DEBUG: デバイスIDの取得完了を待機しています…")
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      try {
        await startPlayback(deviceId.current, trackId)
        calledTrackFinishCallback = false
      } finally {
        setIsPreparingPlayback(false)
      }
    },
    [startPlayback, setIsPreparingPlayback]
  )

  const onPause = useCallback(async () => {
    if (player === undefined) return
    await player.pause()
  }, [player])

  const onResume = useCallback(async () => {
    if (player === undefined) return
    await player.resume()
  }, [player])

  const onSeekTo = useCallback(
    async (position: number) => {
      if (player === undefined) return
      await player.seek(position)
    },
    [player]
  )

  /** useEffectの中でaccessToken.tokenを直接参照すると更新後の最新のトークンを取得できないので、最新のトークン取得用関数として外出しする */
  const getLatestToken = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const latestToken = await snapshot.getPromise(spotifyAccessTokenAtom)
        return latestToken!.token // useEffect内でundefinedチェックがあるのでこの関数が実行される時点でaccessTokenがundefinedになることはない
      },
    []
  )

  /** Web Playback SDK */
  useEffect(() => {
    if (accessToken === undefined || player || !initialize) return

    const script = document.createElement("script")
    script.src = "https://sdk.scdn.co/spotify-player.js"
    script.async = true

    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "MixJuice",
        getOAuthToken: async setToken => {
          const token = await getLatestToken()
          setToken(token)
        },
        volume: 0.5
      })

      setPlayer(spotifyPlayer)

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("🟩DEBUG: Spotify WebPlaybackSDKの準備が完了しました")
        console.log("デバイスID: ", device_id)
        deviceId.current = device_id
      })

      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("🟧DEBUG: Spotify WebPlaybackSDKがNot Readyになりました")
        deviceId.current = device_id
      })

      spotifyPlayer.addListener("player_state_changed", state => {
        if (
          !calledTrackFinishCallback &&
          state.track_window.previous_tracks.length > 0 &&
          state.track_window.previous_tracks[0].id ===
            state.track_window.current_track.id
        ) {
          onTrackFinish()
          setPlaybackQuality(undefined)
          calledTrackFinishCallback = true
        }
      })

      setInterval(async () => {
        const state = await spotifyPlayer.getCurrentState()
        if (state === null) return

        setPlaybackState(state)
        setPlaybackQuality(state.playback_quality)
      }, 100)

      spotifyPlayer.connect()
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [accessToken, initialize, onTrackFinish, player, getLatestToken])

  return {
    playbackPosition,
    onPlay,
    onPause,
    onResume,
    onSeekTo,
    playbackQuality
  } as const
}

export default useSpotifyPlayer
