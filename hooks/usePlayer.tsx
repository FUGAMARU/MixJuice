import { useLocalStorage } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import retry from "async-retry"
import { useCallback, useEffect, useMemo, useState } from "react"

import { useRecoilCallback, useRecoilState } from "recoil"
import useMediaSession from "./useMediaSession"
import useSpotifyPlayer from "./useSpotifyPlayer"
import useWebDAVPlayer from "./useWebDAVPlayer"
import { playbackHistoryAtom } from "@/atoms/playbackHistoryAtom"
import { playbackHistoryIndexAtom } from "@/atoms/playbackHistoryIndexAtom"
import { queueAtom } from "@/atoms/queueAtom"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { Provider } from "@/types/Provider"
import { Queue } from "@/types/Queue"
import { Track, removePlayNextProperty } from "@/types/Track"
import { isDefined } from "@/utils/isDefined"

type Props = {
  initialize: boolean
}

const usePlayer = ({ initialize }: Props) => {
  const [queue, setQueue] = useRecoilState(queueAtom) // useStateにすると、Spotifyの楽曲再生終了時のハンドラー内で、何故か最新のqueueが取得できなくなるのでRecoilStateを利用
  const [playbackHistory, setPlaybackHistory] =
    useRecoilState(playbackHistoryAtom) // useStateにすると、Spotifyの楽曲再生終了時のハンドラー内で、何故か最新のqueueが取得できなくなるのでRecoilStateを利用
  const [playbackHistoryIndex, setPlaybackHistoryIndex] = useRecoilState(
    playbackHistoryIndexAtom
  ) // useStateにすると、Spotifyの楽曲再生終了時のハンドラー内で、何故か最新のqueueが取得できなくなるのでRecoilStateを利用
  const [currentTrackInfo, setCurrentTrackInfo] = useState<Track>()
  const [playbackPosition, setPlaybackPosition] = useState(0) // 再生位置 | 単位: ミリ秒
  const [volume, setVolume] = useLocalStorage<number>({
    key: LOCAL_STORAGE_KEYS.VOLUME,
    defaultValue: 50
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPreparingPlayback, setIsPreparingPlayback] = useState(false)

  const hasNextTrack = useMemo(() => queue.length > 0, [queue.length])
  const hasPreviousTrack = useMemo(
    () => playbackHistory.length > 0,
    [playbackHistory.length]
  )

  const lastPlayNextIdx = useMemo(
    () =>
      queue.reduceRight((acc, item, index) => {
        if (item.playNext && acc === -1) {
          return index
        }
        return acc
      }, -1),
    [queue]
  )

  const checkCanMoveToFront = useCallback((idx: number) => {
    if (idx === 0) return false
    return true
  }, [])

  const checkCanAddToFront = useCallback(
    (idx: number, nextPlay: boolean) => {
      if (idx === 0 || nextPlay) return false
      if (lastPlayNextIdx === -1 || idx === lastPlayNextIdx + 1) return false
      return true
    },
    [lastPlayNextIdx]
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
    [currentTrackInfo, setCurrentTrackInfo] // 「currentTrackInfo」はpickUpTrack内で使っていなくても、depsに含めないとonPlay内で最新のcurrentTrackInfoが取得できない
  )

  const onPlayFromPlaybackHistory = useRecoilCallback(
    ({ snapshot, set }) =>
      async (index: number) => {
        const currentPlaybackHistory =
          await snapshot.getPromise(playbackHistoryAtom)
        await onPlay(currentPlaybackHistory[index], true)
        set(playbackHistoryIndexAtom, index)
      },
    [currentTrackInfo] // 「currentTrackInfo」はonPlayFromPlaybackHistory内で使っていなくても、depsに含めないとonPlay内で最新のcurrentTrackInfoが取得できない
  )

  const checkAndPlayFromPlaybackHistory = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        /** 再生履歴が存在する場合は再生履歴を遡って楽曲を再生する */
        const currentPlaybackHistory =
          await snapshot.getPromise(playbackHistoryAtom)
        const currentPlaybackHistoryIndex = await snapshot.getPromise(
          playbackHistoryIndexAtom
        )

        if (
          currentPlaybackHistory.length > 0 &&
          currentPlaybackHistoryIndex > 0
        ) {
          await onPlayFromPlaybackHistory(currentPlaybackHistoryIndex - 1)
          set(playbackHistoryIndexAtom, currentPlaybackHistoryIndex - 1)
          return true
        }

        return false
      },
    [currentTrackInfo] // 「currentTrackInfo」はcheckAndPlayFromPlaybackHistory内で使っていなくても、depsに含めないとonPlay内で最新のcurrentTrackInfoが取得できない
  )

  const handleTrackFinish = useCallback(async () => {
    const hasStartedPlaybackFromHistory =
      await checkAndPlayFromPlaybackHistory()
    if (hasStartedPlaybackFromHistory) return

    setIsPlaying(false)
    clearDummyAudio()

    onNextTrack()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCurrentTrackInfo, checkAndPlayFromPlaybackHistory])

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
    volume: volume ?? 0,
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
    volume: volume ?? 0,
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
    async (currentProvider: Provider, nextProvider: Provider) => {
      /** Spotifyの曲同士で曲送りする時に一旦ポーズさせると、次の曲の再生開始時に502 Bad Gatewayが発生する可能性がある (理由不明) */
      if (currentProvider === "spotify" && nextProvider === "spotify") return

      await onPause()
    },
    [onPause]
  )

  const onNextTrack = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const hasStartedPlaybackFromHistory =
          await checkAndPlayFromPlaybackHistory()
        if (hasStartedPlaybackFromHistory) return

        /** 再生待ちの曲がない場合は曲送りする必要がない */
        const hasNextTrack = (await snapshot.getPromise(queueAtom)).length > 0 // このフックの一番上のスコープで定義しているhasNextTrackを利用したいところだが、Spotifyの楽曲終了時のhandleTrackFinishからこのonNextTrackを呼ぶと、正しいhasNextTrackの値が取得できないので仕方なくここでQueueのsnapshopを取得して判定している
        if (!hasNextTrack) {
          await onPause()
          setCurrentTrackInfo(undefined)
          return
        }

        setIsPlaying(false)
        pickUpTrack()
      },
    [currentTrackInfo, pickUpTrack, onPause, checkAndPlayFromPlaybackHistory] // 「currentTrackInfo」はonNextTrack内で使っていなくても、depsに含めないとonPlay内で最新のcurrentTrackInfoが取得できない
  )

  const onPreviousTrack = useCallback(async () => {
    if (playbackHistory.length === 0) return

    /** 再生履歴が2曲以上存在し、かつ楽曲開始後1秒以内に実行した時のみ、再生履歴を遡って楽曲を再生する (それ以外はシークポジションを0にして曲頭に戻るだけ) */
    if (playbackHistory.length >= 2 && playbackPosition < 1000) {
      await onPlay(playbackHistory[playbackHistoryIndex + 1], true)
      setPlaybackHistoryIndex(prev => prev + 1)
      return
    }

    onSeekTo(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackHistory, playbackPosition, playbackHistoryIndex, onSeekTo])

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
    isPreparingPlayback,
    hasNextTrack,
    hasPreviousTrack,
    onPause,
    onResume,
    onNextTrack,
    onPreviousTrack,
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
    async (track: Track, inPlaybackHistory?: boolean) => {
      setIsPreparingPlayback(true)
      setCurrentTrackInfo(track)

      if (isDefined(currentTrackInfo)) {
        await smartPause(currentTrackInfo.provider, track.provider)
      }

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

        if (!inPlaybackHistory) {
          setPlaybackHistory(prev => [track, ...prev])
          setPlaybackHistoryIndex(0)
        }
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
      onNextTrack,
      setPlaybackHistory,
      setPlaybackHistoryIndex,
      smartPause,
      currentTrackInfo
    ]
  )

  const onSkipTo = useCallback(
    async (queueItem: Queue) => {
      if (queue.some(item => item === undefined)) {
        throw new Error(
          "キューに不正なアイテムが含まれています。IndexedDBのリセットをお試しください。"
        )
      }

      setQueue(prevQueue => prevQueue.filter(item => item.id !== queueItem.id))

      const trackInfo = removePlayNextProperty(queueItem)
      await onPlay(trackInfo)
    },
    [queue, setQueue, onPlay]
  )

  const onMoveToFront = useCallback(
    (id: string) => {
      const idx = queue.findIndex(item => item.id === id)
      if (idx === -1) return

      const newQueue = [...queue]
      const [item] = newQueue.splice(idx, 1)
      const newItem = { ...item, playNext: true }
      newQueue.unshift(newItem)
      setQueue(newQueue)
    },
    [queue, setQueue]
  )

  const onAddToFront = useCallback(
    (id: string) => {
      const idx = queue.findIndex(item => item.id === id)
      if (idx === -1 || lastPlayNextIdx === -1) return

      const newQueue = [...queue]

      const itemToMove = { ...newQueue[idx], playNext: true }
      newQueue.splice(idx, 1)
      newQueue.splice(lastPlayNextIdx + 1, 0, itemToMove)

      setQueue(newQueue)
    },
    [queue, setQueue, lastPlayNextIdx]
  )

  const onMoveNewTrackToFront = useCallback(
    (track: Track) => {
      setQueue(prevQueue => {
        const newItem = { ...track, playNext: true }
        return [newItem, ...prevQueue]
      })
    },
    [setQueue]
  )

  const onAddNewTrackToFront = useCallback(
    (track: Track) => {
      setQueue(prevQueue => {
        const newItem = { ...track, playNext: true }
        const newQueue = [...prevQueue]
        const lastPlayNextIdx = prevQueue.reduceRight((acc, item, index) => {
          if (item.playNext && acc === -1) {
            return index
          }
          return acc
        }, -1)
        newQueue.splice(lastPlayNextIdx + 1, 0, newItem)
        return newQueue
      })
    },
    [setQueue]
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
    queue,
    setQueue,
    playbackHistory,
    playbackHistoryIndex,
    currentTrackInfo,
    playbackPercentage,
    isPlaying,
    volume,
    setVolume,
    onNextTrack,
    onPreviousTrack,
    onSkipTo,
    onPlay,
    onPlayFromPlaybackHistory,
    onMoveToFront,
    onAddToFront,
    checkCanMoveToFront,
    checkCanAddToFront,
    onTogglePlay,
    hasNextTrack,
    hasPreviousTrack,
    spotifyPlaybackQuality,
    isPreparingPlayback,
    setIsPreparingPlayback,
    onMoveNewTrackToFront,
    onAddNewTrackToFront,
    onSeekTo
  } as const
}

export default usePlayer
