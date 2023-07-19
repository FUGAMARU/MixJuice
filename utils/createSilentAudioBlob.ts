export const createSilentAudioBlob = async (
  durationInMilliseconds: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    const audioContext = new AudioContext()

    const bufferSize = (audioContext.sampleRate * durationInMilliseconds) / 1000
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    )
    const data = buffer.getChannelData(0)

    // サンプルデータに無音を追加
    for (let i = 0; i < bufferSize; i++) {
      data[i] = 0
    }

    // AudioBufferからBlobを生成
    const audioBlobCallback = (blob: Blob | null) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error("Failed to create audio blob"))
      }
    }

    // AudioBufferをWAV形式のBlobに変換
    bufferToWaveBlob(buffer, audioBlobCallback)
  })
}

const bufferToWaveBlob = (
  buffer: AudioBuffer,
  callback: (blob: Blob | null) => void
) => {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const length = buffer.length
  const data = new Float32Array(length * numChannels)

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      data[i * numChannels + channel] = channelData[i]
    }
  }

  // Float32ArrayのデータをWAVフォーマットに変換
  const format = 1 // WAVフォーマットの場合は1
  const wavBlob = new Blob(
    [createWaveFile(data, numChannels, sampleRate, format)],
    {
      type: "audio/wav"
    }
  )

  callback(wavBlob)
}

const createWaveFile = (
  data: Float32Array,
  numChannels: number,
  sampleRate: number,
  format: number
): ArrayBuffer => {
  const buffer = new ArrayBuffer(44 + data.length * 2)
  const view = new DataView(buffer)

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  let offset = 0
  writeString(view, offset, "RIFF")
  offset += 4
  view.setUint32(offset, 36 + data.length * 2, true)
  offset += 4
  writeString(view, offset, "WAVE")
  offset += 4
  writeString(view, offset, "fmt ")
  offset += 4
  view.setUint32(offset, 16, true)
  offset += 4
  view.setUint16(offset, format, true)
  offset += 2
  view.setUint16(offset, numChannels, true)
  offset += 2
  view.setUint32(offset, sampleRate, true)
  offset += 4
  view.setUint32(offset, sampleRate * numChannels * 2, true)
  offset += 4
  view.setUint16(offset, numChannels * 2, true)
  offset += 2
  view.setUint16(offset, 16, true)
  offset += 2
  writeString(view, offset, "data")
  offset += 4
  view.setUint32(offset, data.length * 2, true)
  offset += 4
  for (let i = 0; i < data.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, data[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return buffer
}
