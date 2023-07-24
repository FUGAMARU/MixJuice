/** 結果はミリ秒で返る */
export const getAudioDurationFromUrl = async (url: string): Promise<number> => {
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
