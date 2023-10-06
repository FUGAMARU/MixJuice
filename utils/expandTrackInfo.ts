import { isDefined } from "./isDefined"
import { Track } from "@/types/Track"

export const expandTrackInfo = async <T extends Track>(trackInfo: T) => {
  const duration = await getAudioDurationFromUrl(trackInfo.id) // 結果はミリ秒で返ってくる

  const baseObj = {
    ...trackInfo,
    duration
  }

  if (isDefined(trackInfo.image)) {
    const imgSize = await getImageSizeFromBase64(trackInfo.image.src)
    return {
      ...baseObj,
      image: {
        src: trackInfo.image.src,
        height: imgSize.height,
        width: imgSize.width
      }
    }
  }

  return {
    ...baseObj,
    image: undefined
  }
}

/** 結果はミリ秒で返る */
const getAudioDurationFromUrl = async (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    audio.onloadedmetadata = () => {
      const duration = audio.duration * 1000
      resolve(duration)
    }
    audio.onerror = () => {
      reject(new Error("オーディオファイルの長さの取得に失敗しました"))
    }
  })
}

const getImageSizeFromBase64 = async (
  base64Data: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const width = img.width
      const height = img.height
      resolve({ width, height })
    }

    img.onerror = () => {
      reject(new Error("アートワークのサイズの取得に失敗しました"))
    }

    img.src = base64Data
  })
}
