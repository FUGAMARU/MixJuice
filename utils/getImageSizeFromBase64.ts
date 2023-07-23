export const getImageSizeFromBase64 = async (
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
