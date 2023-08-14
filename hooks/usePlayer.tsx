import { notifications } from "@mantine/notifications"
import retry from "async-retry"
import { useCallback, useEffect, useMemo, useState } from "react"

import { useRecoilCallback, useRecoilState, useSetRecoilState } from "recoil"
import useMediaSession from "./useMediaSession"
import useSpotifyPlayer from "./useSpotifyPlayer"
import useWebDAVPlayer from "./useWebDAVPlayer"
import { errorModalInstanceAtom } from "@/atoms/errorModalInstanceAtom"
import { preparingPlaybackAtom } from "@/atoms/preparingPlaybackAtom"
import { queueAtom } from "@/atoms/queueAtom"
import { Provider } from "@/types/Provider"
import { Track } from "@/types/Track"

type Props = {
  initialize: boolean
}

const usePlayer = ({ initialize }: Props) => {
  const setErrorModalInstance = useSetRecoilState(errorModalInstanceAtom)
  const [queue, setQueue] = useRecoilState(queueAtom)
  const [currentTrackInfo, setCurrentTrackInfo] = useState<Track>()
  const [playbackPosition, setPlaybackPosition] = useState(0) // 再生位置 | 単位: ミリ秒
  const [volume, setVolume] = useState(0.5)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPreparingPlayback, setIsPreparingPlayback] = useRecoilState(
    preparingPlaybackAtom
  )
  const [isInitialized, setIsInitialized] = useState(true)

  const hasSomeTrack = useMemo(
    () => queue.length > 0 || currentTrackInfo !== undefined,
    [queue.length, currentTrackInfo]
  )

  /** キューの先頭にあるトラックを再生開始する */
  const pickUpTrack = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const currentQueue = await snapshot.getPromise(queueAtom)
        if (currentQueue.length === 0) return

        setCurrentTrackInfo(currentQueue[0])
        await onPlay(currentQueue[0])

        set(queueAtom, currentQueue.slice(1))
      },
    [setCurrentTrackInfo]
  )

  const handleTrackFinish = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const currentQueue = await snapshot.getPromise(queueAtom)

        setIsPlaying(false)
        clearDummyAudio()

        if (currentQueue.length > 0) {
          onNextTrack()
          return
        }

        setCurrentTrackInfo(undefined)
      },
    []
  )

  const {
    playbackPosition: spotifyPlaybackPosition, // 単位: ミリ秒
    onPlay: onSpotifyPlay,
    onPause: onSpotifyPause,
    onResume: onSpotifyResume,
    onSeekTo: onSpotifySeekTo,
    playbackQuality: spotifyPlaybackQuality
  } = useSpotifyPlayer({
    initialize,
    setIsPreparingPlayback,
    onTrackFinish: handleTrackFinish
  })

  const {
    onPlay: onWebDAVPlay,
    onPause: onWebDAVPause,
    onResume: onWebDAVResume,
    onSeekTo: onWebDAVSeekTo,
    playbackPosition: webDAVPlaybackPosition // 単位: ミリ秒
  } = useWebDAVPlayer({
    currentTrackInfo,
    setIsPreparingPlayback,
    onTrackFinish: handleTrackFinish
  })

  const onSeekTo = useCallback(
    async (position: number) => {
      // positionはミリ秒
      if (currentTrackInfo === undefined) return

      switch (currentTrackInfo.provider) {
        case "spotify":
          await onSpotifySeekTo(position)
          onDummyAudioSeekTo(position)
          break
        case "webdav":
          onWebDAVSeekTo(position)
          break
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTrackInfo, onSpotifySeekTo, onWebDAVSeekTo]
  )

  const onPause = useCallback(async () => {
    if (currentTrackInfo === undefined) return

    switch (currentTrackInfo.provider) {
      case "spotify":
        await onSpotifyPause()
        onPauseDummyAudio()
        break
      case "webdav":
        onWebDAVPause()
        break
    }

    setIsPlaying(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackInfo, onSpotifyPause, onWebDAVPause])

  /** 曲送りをする際に、再生中の曲のProviderと次の曲のProviderの組み合わせによって、現在の再生を一時停止させるかどうかが変わってくるので、このsmartPauseで吸収する */
  const smartPause = useCallback(
    async (nextProvider: Provider) => {
      if (currentTrackInfo === undefined) return
      /** Spotifyの曲同士で曲送りする時に一旦ポーズさせると、次の曲の再生開始時に502 Bad Gatewayが発生する可能性がある (理由不明) */
      if (currentTrackInfo.provider === "spotify" && nextProvider === "spotify")
        return

      await onPause()
    },
    [currentTrackInfo, onPause]
  )

  const onNextTrack = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const currentQueue = await snapshot.getPromise(queueAtom)

        /** 再生待ちの曲がない場合は曲送りする必要がない */
        if (currentQueue.length === 0) {
          await onPause()
          return
        }

        await smartPause(currentQueue[0].provider)

        setIsPlaying(false)
        pickUpTrack()
      },
    [currentTrackInfo, pickUpTrack] // 「currentTrackInfo」はonNextTrack内で使っていなくても、depsに含めないとsmartPause内で最新のcurrentTrackInfoが取得できない
  )

  const onResume = useCallback(async () => {
    setIsPlaying(true)

    switch (currentTrackInfo?.provider) {
      case "spotify":
        await onSpotifyResume()
        onResumeDummyAudio()
        break
      case "webdav":
        await onWebDAVResume()
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackInfo, onSpotifyResume, onWebDAVResume])

  const {
    onPlayDummyAudio,
    onDummyAudioSeekTo,
    clearDummyAudio,
    onPauseDummyAudio,
    onResumeDummyAudio
  } = useMediaSession({
    initialize,
    trackInfo: currentTrackInfo,
    playbackPosition,
    isPlaying,
    onPause,
    onResume,
    onNextTrack,
    onSeekTo
  })

  const onTogglePlay = useCallback(async () => {
    setIsPlaying(prev => !prev)

    if (isPlaying) {
      await onPause()
    } else {
      await onResume()
    }
  }, [isPlaying, onPause, onResume])

  const onPlay = useCallback(
    async (track: Track) => {
      setIsPreparingPlayback(true)

      try {
        await retry(
          async () => {
            switch (track.provider) {
              case "spotify":
                await onSpotifyPlay(track.id)
                await onPlayDummyAudio(track.duration)
                break
              case "webdav":
                await onWebDAVPlay(track.id)
                break
            }
          },
          {
            retries: 3,
            factor: 1.5,
            minTimeout: 500,
            onRetry: () => console.log("🟧DEBUG: onPlay()をリトライします...")
          }
        )

        /** 再生開始が正常に完了した場合はここに処理が遷移する */
        setIsPlaying(true)
      } catch (e) {
        /** エラーモーダルは表示せずにトースト表示のみ */
        console.log("🟥ERROR: onPlay()実行時にエラーが発生しました")
        console.log(`🟥ERROR: ${e}`)

        onNextTrack()
        notifications.show({
          withCloseButton: true,
          title: "再生をスキップしました",
          message:
            "再生開始処理に何度か失敗したため当該楽曲の再生をスキップしました",
          color: "gray",
          autoClose: 5000
        })
      }
    },
    [
      onSpotifyPlay,
      onWebDAVPlay,
      onPlayDummyAudio,
      setIsPreparingPlayback,
      onNextTrack
    ]
  )

  const onSkipTo = useCallback(
    async (id: string) => {
      if (queue.some(item => item === undefined)) {
        setErrorModalInstance(prev => [
          ...prev,
          new Error(
            "キューに不正なアイテムが含まれています。IndexedDBのリセットをお試しください。"
          )
        ])
        return
      }

      const provider = queue
        .filter(item => item.id === id)
        .map(item => item.provider)

      await smartPause(provider[0]) // IDは一意の値なので、providerは必ず1つになる

      const idx = queue.findIndex(item => item.id === id)
      if (idx === -1) return

      const newQueue = [...queue]
      const [item] = newQueue.splice(idx, 1)
      newQueue.unshift(item)
      setQueue(newQueue)
      pickUpTrack()
    },
    [queue, setQueue, smartPause, setErrorModalInstance, pickUpTrack]
  )

  const onMoveToFront = useCallback(
    (id: string) => {
      const idx = queue.findIndex(item => item.id === id)
      if (idx === 0 || idx === -1) return

      const newQueue = [...queue]
      const [item] = newQueue.splice(idx, 1)
      newQueue.unshift(item)
      setQueue(newQueue)
    },
    [queue, setQueue]
  )

  /** 再生位置の更新 */
  useEffect(() => {
    if (currentTrackInfo === undefined) return

    switch (currentTrackInfo.provider) {
      case "spotify":
        setPlaybackPosition(spotifyPlaybackPosition)
        break
      case "webdav":
        setPlaybackPosition(webDAVPlaybackPosition)
        break
    }
  }, [currentTrackInfo, spotifyPlaybackPosition, webDAVPlaybackPosition])

  /** キューが更新されたらアイテムの1番目の曲を再生開始する */
  useEffect(() => {
    if (isInitialized && queue.length > 0) {
      pickUpTrack()
      setIsInitialized(false)
    }
  }, [isInitialized, pickUpTrack, queue])

  useEffect(() => {
    if (queue.length === 0) setIsInitialized(true)
  }, [queue, setIsInitialized])

  const playbackPercentage = useMemo(() => {
    if (currentTrackInfo === undefined) return 0

    switch (currentTrackInfo.provider) {
      case "spotify":
        return (spotifyPlaybackPosition / currentTrackInfo.duration) * 100

      case "webdav":
        return (webDAVPlaybackPosition / currentTrackInfo.duration) * 100
    }
  }, [currentTrackInfo, spotifyPlaybackPosition, webDAVPlaybackPosition])

  return {
    currentTrackInfo,
    playbackPercentage,
    isPlaying,
    volume,
    setVolume,
    onNextTrack,
    onSkipTo,
    onMoveToFront,
    onTogglePlay,
    hasSomeTrack,
    spotifyPlaybackQuality,
    isPreparingPlayback
  } as const
}

export default usePlayer
