import { useCallback, useEffect, useState } from "react"

import { useRecoilState } from "recoil"
import useSpotifyPlayer from "./useSpotifyPlayer"
import { musicListAtom } from "@/atoms/musicListAtom"
import { MusicListItem } from "@/types/MusicListItem"
import { Provider } from "@/types/Provider"

let isPlaying = false

const usePlayer = () => {
  const [musicList, setMusicList] = useRecoilState(musicListAtom)
  const [currentMusic, setCurrentMusic] = useState<MusicListItem>()
  const [playbackPosition, setPlaybackPosition] = useState(0) // 再生位置 | 単位: %
  const [volume, setVolume] = useState(0.5)
  const { onSpotifyPlay } = useSpotifyPlayer()

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

  /** キューが更新されたらアイテムの1番目の曲を再生開始する */
  useEffect(() => {
    if (musicList.length === 0 || isPlaying) return

    isPlaying = true
    setCurrentMusic(musicList[0])
    setMusicList(prev => prev.slice(1))
    onPlay(musicList[0].provider, musicList[0].id)
  }, [musicList, onPlay, setMusicList])

  return {
    currentMusic,
    playbackPosition,
    volume,
    setVolume
  } as const
}

export default usePlayer
