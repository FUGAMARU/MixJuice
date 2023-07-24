import { useCallback, useEffect, useMemo, useState } from "react"

import { useRecoilCallback, useRecoilState } from "recoil"
import useMediaSession from "./useMediaSession"
import useSpotifyPlayer from "./useSpotifyPlayer"
import useWebDAVPlayer from "./useWebDAVPlayer"
import { queueAtom } from "@/atoms/queueAtom"
import { Provider } from "@/types/Provider"
import { Track } from "@/types/Track"

/** キューの内容が変更されても再生中の楽曲を変更しないかどうか
 * 基本的にtrueにしておくが、楽曲終了後などに曲送りをしたい場合はキューが操作される前にfalseにしておく
 * 曲送り処理開始時に自動的にtrueに戻る
 */
let isLockingPlayer = false

type Props = {
  initialize: boolean
}

const usePlayer = ({ initialize }: Props) => {
  const [queue, setQueue] = useRecoilState(queueAtom)
  const [currentTrackInfo, setCurrentTrackInfo] = useState<Track>()
  const [playbackPosition, setPlaybackPosition] = useState(0) // 再生位置 | 単位: %
  const [volume, setVolume] = useState(0.5)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackFeedTrigger, setTrackFeedTrigger] = useState(false) // useCallbackとRecoilStateがうまく連携しないため、トリガーを操作することによってuseEffect内の曲送り処理を実行する

  const hasSomeTrack = useMemo(
    () => queue.length > 0 || currentTrackInfo !== undefined,
    [queue.length, currentTrackInfo]
  )

  const handleTrackFinish = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const currentQueue = await snapshot.getPromise(queueAtom)

        setIsPlaying(false)
        isLockingPlayer = false
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
    playbackPosition: spotifyPlaybackPosition,
    onPlay: onSpotifyPlay,
    onPause: onSpotifyPause,
    onResume: onSpotifyResume
  } = useSpotifyPlayer({
    initialize,
    onTrackFinish: handleTrackFinish
  })

  const {
    onPlay: onWebDAVPlay,
    onPause: onWebDAVPause,
    onResume: onWebDAVResume,
    playbackPosition: webDAVPlaybackPosition
  } = useWebDAVPlayer({ currentTrackInfo, onTrackFinish: handleTrackFinish })

  const onPause = useCallback(async () => {
    if (currentTrackInfo === undefined) return

    switch (currentTrackInfo.provider) {
      case "spotify":
        await onSpotifyPause()
        break
      case "webdav":
        onWebDAVPause()
        break
    }

    setIsPlaying(false)
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

  const onNextTrack = useCallback(async () => {
    /** 再生待ちの曲がない場合は曲送りする必要がない */
    if (queue.length === 0) {
      await onPause()
      return
    }

    await smartPause(queue[0].provider)

    setIsPlaying(false)
    isLockingPlayer = false
    setTrackFeedTrigger(prev => !prev)
  }, [smartPause, onPause, queue])

  const onResume = useCallback(async () => {
    setIsPlaying(true)

    switch (currentTrackInfo?.provider) {
      case "spotify":
        await onSpotifyResume()
        break
      case "webdav":
        await onWebDAVResume()
        break
    }
  }, [currentTrackInfo, onSpotifyResume, onWebDAVResume])

  const { onPlayDummyAudio, clearDummyAudio } = useMediaSession({
    initialize,
    trackInfo: currentTrackInfo,
    playbackPosition,
    onPause,
    onResume,
    onNextTrack
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
      switch (track.provider) {
        case "spotify":
          await onSpotifyPlay(track.id)
          await onPlayDummyAudio(track.duration)
          break
        case "webdav":
          await onWebDAVPlay(track.id)
          break
      }

      setIsPlaying(true)
    },
    [onSpotifyPlay, onWebDAVPlay, onPlayDummyAudio]
  )

  const onSkipTo = useCallback(
    async (id: string) => {
      const provider = queue
        .filter(item => item.id === id)
        .map(item => item.provider)

      await smartPause(provider[0]) // IDは一意の値なので、providerは必ず1つになる

      isLockingPlayer = false
      const idx = queue.findIndex(item => item.id === id)
      if (idx === -1) return

      const newQueue = [...queue]
      const [item] = newQueue.splice(idx, 1)
      newQueue.unshift(item)
      setQueue(newQueue)
      setTrackFeedTrigger(prev => !prev)
    },
    [queue, setQueue, smartPause]
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
    if (queue.length === 0 || isLockingPlayer) return

    isLockingPlayer = true
    setCurrentTrackInfo(queue[0])
    setQueue(prev => prev.slice(1))
    onPlay(queue[0])
  }, [queue, onPlay, setQueue, trackFeedTrigger, currentTrackInfo])

  return {
    currentTrackInfo,
    playbackPosition,
    isPlaying,
    volume,
    setVolume,
    onNextTrack,
    onSkipTo,
    onTogglePlay,
    hasSomeTrack
  } as const
}

export default usePlayer
