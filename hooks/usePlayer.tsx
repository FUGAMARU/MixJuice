import { useCallback, useEffect, useMemo, useState } from "react"

import { useRecoilCallback, useRecoilState } from "recoil"
import useMediaSession from "./useMediaSession"
import useSpotifyPlayer from "./useSpotifyPlayer"
import { queueAtom } from "@/atoms/queueAtom"
import { Provider } from "@/types/Provider"
import { Track } from "@/types/Track"

let isLockingPlayer = false // trueの場合はキューの内容が変更されても曲送りしない (isPlayingと同じ使い方をすると曲送り用のuseEffectが無限ループに陥るので分けている)

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

  const onNextTrack = useCallback(() => {
    setIsPlaying(false)
    isLockingPlayer = false
    setTrackFeedTrigger(prev => !prev)
  }, [])

  const handleTrackFinish = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const currentQueue = await snapshot.getPromise(queueAtom)

        setIsPlaying(false)
        isLockingPlayer = false

        if (currentQueue.length > 0) {
          onNextTrack()
          return
        }

        setCurrentTrackInfo(undefined)
      },
    [onNextTrack]
  )

  const {
    playbackPosition: spotifyPlaybackPosition,
    onPlay: onSpotifyPlay,
    onPause: onSpotifyPuase,
    onResume: onSpotifyResume
  } = useSpotifyPlayer({
    initialize,
    onTrackFinish: handleTrackFinish
  })

  const onPause = useCallback(async () => {
    setIsPlaying(false)

    switch (currentTrackInfo?.provider) {
      case "spotify":
        await onSpotifyPuase()
        break
      case "webdav":
        // TODO: webdavの一時停止処理
        break
    }
  }, [currentTrackInfo?.provider, onSpotifyPuase])

  const onResume = useCallback(async () => {
    setIsPlaying(true)

    switch (currentTrackInfo?.provider) {
      case "spotify":
        await onSpotifyResume()
        break
      case "webdav":
        // TODO: webdavの再生再開処理
        break
    }
  }, [currentTrackInfo?.provider, onSpotifyResume])

  const { onMediaSessionPause, onMediaSessionResume, clearMediaSession } =
    useMediaSession({
      initialize,
      trackInfo: currentTrackInfo,
      playbackPosition,
      onPause,
      onResume,
      onNextTrack
    })

  const onTogglePlay = useCallback(async () => {
    setIsPlaying(prev => !prev)

    switch (currentTrackInfo?.provider) {
      case "spotify":
        if (isPlaying) {
          await onMediaSessionPause()
        } else {
          await onMediaSessionResume()
        }
        break
      case "webdav":
        // TODO: webdavのトグル再生処理
        break
    }
  }, [
    currentTrackInfo?.provider,
    isPlaying,
    onMediaSessionPause,
    onMediaSessionResume
  ])

  const onPlay = useCallback(
    async (provider: Provider, trackId: string) => {
      switch (provider) {
        case "spotify":
          await onSpotifyPlay(trackId)
          setIsPlaying(true)
          isLockingPlayer = true
          break
        case "webdav":
          // webdavの再生開始処理
          setIsPlaying(true)
          isLockingPlayer = true
          break
      }
    },
    [onSpotifyPlay]
  )

  const onSkipTo = useCallback(
    (id: string) => {
      setIsPlaying(false)
      isLockingPlayer = false
      const idx = queue.findIndex(item => item.id === id)
      if (idx === -1) return

      const newQueue = [...queue]
      const [item] = newQueue.splice(idx, 1)
      newQueue.unshift(item)
      setQueue(newQueue)
      setTrackFeedTrigger(prev => !prev)
    },
    [queue, setQueue]
  )

  /** Spotify以外ではダミー音源によるMedia Session APIの使用はしないので削除する
   */
  useEffect(() => {
    if (currentTrackInfo?.provider === "spotify") return
    clearMediaSession()
  }, [currentTrackInfo?.provider, clearMediaSession])

  /** 再生位置の更新 */
  useEffect(() => {
    if (currentTrackInfo === undefined) return

    switch (currentTrackInfo.provider) {
      case "spotify":
        setPlaybackPosition(spotifyPlaybackPosition)
        break
      case "webdav":
        // TODO: webdavの再生位置をセットする
        break
    }
  }, [currentTrackInfo, spotifyPlaybackPosition])

  /** キューが更新されたらアイテムの1番目の曲を再生開始する */
  useEffect(() => {
    if (queue.length === 0 || isLockingPlayer) return

    isLockingPlayer = true
    setCurrentTrackInfo(queue[0])
    setQueue(prev => prev.slice(1))
    onPlay(queue[0].provider, queue[0].id)
  }, [queue, onPlay, setQueue, trackFeedTrigger])

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
