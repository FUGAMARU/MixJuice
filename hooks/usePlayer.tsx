import { useCallback, useEffect, useState } from "react"

import { useRecoilState } from "recoil"
import useSpotifyPlayer from "./useSpotifyPlayer"
import { musicListAtom } from "@/atoms/musicListAtom"
import { MusicListItem } from "@/types/MusicListItem"
import { Provider } from "@/types/Provider"

let isPlaying = false

const usePlayer = () => {
  const [musicList, setMusicList] = useRecoilState(musicListAtom)
  const [currentMusicInfo, setCurrentMusicInfo] = useState<MusicListItem>()
  const [playbackPosition, setPlaybackPosition] = useState(0) // 再生位置 | 単位: %
  const [volume, setVolume] = useState(0.5)
  const [trackFeedTrigger, setTrackFeedTrigger] = useState(false) // useCallbackとRecoilStateがうまく連携しないため、トリガーを操作することによってuseEffect内の曲送り処理を実行する

  const handleTrackFinish = () => {
    isPlaying = false
    onNextTrack()
  }

  const { playbackPosition: spotifyPlaybackPosition, onSpotifyPlay } =
    useSpotifyPlayer({ onTrackFinish: handleTrackFinish })

  const onPlay = useCallback(
    async (provider: Provider, trackId: string) => {
      switch (provider) {
        case "spotify":
          onSpotifyPlay(trackId)
          isPlaying = true
          break
        case "webdav":
          // webdavの再生開始処理
          break
      }
    },
    [onSpotifyPlay]
  )

  const onPause = useCallback(() => {
    isPlaying = false
  }, [])

  const onNextTrack = useCallback(() => {
    setTrackFeedTrigger(prev => !prev)
  }, [])

  /** 再生位置の更新 */
  useEffect(() => {
    if (currentMusicInfo === undefined) return

    switch (currentMusicInfo.provider) {
      case "spotify":
        setPlaybackPosition(spotifyPlaybackPosition)
        break
      case "webdav":
        // webdavの再生位置をセットする
        break
    }
  }, [currentMusicInfo, spotifyPlaybackPosition])

  /** キューが更新されたらアイテムの1番目の曲を再生開始する */
  useEffect(() => {
    if (musicList.length === 0 || isPlaying) return

    isPlaying = true
    setCurrentMusicInfo(musicList[0])
    setMusicList(prev => prev.slice(1))
    onPlay(musicList[0].provider, musicList[0].id)
  }, [musicList, onPlay, setMusicList, trackFeedTrigger])

  return {
    currentMusicInfo,
    playbackPosition,
    volume,
    setVolume
  } as const
}

export default usePlayer
