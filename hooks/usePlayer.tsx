import { useCallback, useEffect, useState } from "react"

import { useRecoilState } from "recoil"
import useSpotifyPlayer from "./useSpotifyPlayer"
import { musicListAtom } from "@/atoms/musicListAtom"
import { MusicListItem } from "@/types/MusicListItem"
import { Provider } from "@/types/Provider"

let isLockingPlayer = false // trueの場合はキューの内容が変更されても曲送りしない (isPlayingと同じ使い方をすると曲送り用のuseEffectが無限ループに陥るので分けている)

type Props = {
  initializeUseSpotifyPlayer: boolean
}

const usePlayer = ({ initializeUseSpotifyPlayer }: Props) => {
  const [musicList, setMusicList] = useRecoilState(musicListAtom)
  const [currentMusicInfo, setCurrentMusicInfo] = useState<MusicListItem>()
  const [playbackPosition, setPlaybackPosition] = useState(0) // 再生位置 | 単位: %
  const [volume, setVolume] = useState(0.5)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackFeedTrigger, setTrackFeedTrigger] = useState(false) // useCallbackとRecoilStateがうまく連携しないため、トリガーを操作することによってuseEffect内の曲送り処理を実行する

  const {
    playbackPosition: spotifyPlaybackPosition,
    onPlay: onSpotifyPlay,
    onTogglePlay: onSpotifyTogglePlay
  } = useSpotifyPlayer({
    initialize: initializeUseSpotifyPlayer,
    onTrackFinish: () => {
      setIsPlaying(false)
      isLockingPlayer = false
      onNextTrack()
    }
  })

  const onPlay = useCallback(
    async (provider: Provider, trackId: string) => {
      switch (provider) {
        case "spotify":
          onSpotifyPlay(trackId)
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

  const onTogglePlay = useCallback(() => {
    switch (currentMusicInfo?.provider) {
      case "spotify":
        onSpotifyTogglePlay()
        setIsPlaying(prev => !prev)
        break
      case "webdav":
        // TODO: webdavのトグル再生処理
        setIsPlaying(prev => !prev)
        break
    }
  }, [currentMusicInfo?.provider, onSpotifyTogglePlay])

  const onNextTrack = useCallback(() => {
    setIsPlaying(false)
    isLockingPlayer = false
    setTrackFeedTrigger(prev => !prev)
  }, [])

  const onSkipTo = useCallback(
    (id: string) => {
      setIsPlaying(false)
      isLockingPlayer = false
      const idx = musicList.findIndex(item => item.id === id)
      if (idx === -1) return

      const newMusicList = [...musicList]
      const [item] = newMusicList.splice(idx, 1)
      newMusicList.unshift(item)
      setMusicList(newMusicList)
      setTrackFeedTrigger(prev => !prev)
    },
    [musicList, setMusicList]
  )

  /** 再生位置の更新 */
  useEffect(() => {
    if (currentMusicInfo === undefined) return

    switch (currentMusicInfo.provider) {
      case "spotify":
        setPlaybackPosition(spotifyPlaybackPosition)
        break
      case "webdav":
        // TODO: webdavの再生位置をセットする
        break
    }
  }, [currentMusicInfo, spotifyPlaybackPosition])

  /** キューが更新されたらアイテムの1番目の曲を再生開始する */
  useEffect(() => {
    if (musicList.length === 0 || isLockingPlayer) return

    isLockingPlayer = true
    setCurrentMusicInfo(musicList[0])
    setMusicList(prev => prev.slice(1))
    onPlay(musicList[0].provider, musicList[0].id)
  }, [musicList, onPlay, setMusicList, trackFeedTrigger])

  return {
    currentMusicInfo,
    playbackPosition,
    isPlaying,
    volume,
    setVolume,
    onNextTrack,
    onSkipTo,
    onTogglePlay
  } as const
}

export default usePlayer
