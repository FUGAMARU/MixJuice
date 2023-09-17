import { parseBuffer } from "music-metadata-browser"
import { useCallback } from "react"
import { createClient } from "webdav"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { TrackWithPath, removePathProperty } from "@/types/Track"
import { WebDAVDirectoryContent } from "@/types/WebDAVDirectoryContent"
import { expandTrackInfo } from "@/utils/expandTrackInfo"
import { getMimeType } from "@/utils/getMimeType"

const useWebDAVServer = () => {
  const getClient = useCallback(() => {
    const address = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_ADDRESS)
    const username = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_USER)
    const password = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_PASSWORD)

    if (!address || !username || !password) return undefined

    return createClient(address, {
      username,
      password
    })
  }, [])

  const isServerConnectionValidWithAuthConfig = useCallback(
    async (address: string, username: string, password: string) => {
      try {
        // この時点ではまだLocalStorageに認証情報がないので認証情報は引数として受け取る
        await createClient(address, {
          username,
          password
        }).getQuota()
      } catch (e) {
        console.log(`🟥ERROR: ${e}`)
        throw new Error(
          "指定された認証情報でWebDAVサーバに接続・認証できませんでした"
        )
      }
    },
    []
  )

  const isServerConnectionValid = useCallback(async () => {
    const client = getClient()
    if (!client)
      throw new Error(
        "設定されている認証情報でWebDAVサーバに接続・認証できませんでした"
      )

    try {
      await client.getQuota()
    } catch (e) {
      console.log(`🟥ERROR: ${e}`)
      throw new Error(
        "設定されている認証情報でWebDAVサーバに接続・認証できませんでした"
      )
    }
  }, [getClient])

  const checkIsFolderExists = useCallback(
    async (folderPath: string) => {
      const client = getClient()
      if (!client) return false

      try {
        const isExists = await client.exists(folderPath)
        return isExists
      } catch (e) {
        console.log(`🟥ERROR: ${e}`)
        return false
      }
    },
    [getClient]
  )

  const getFolderTracks = useCallback(
    async (folderPath: string, keyword: string) => {
      try {
        const client = getClient()
        if (!client) throw new Error("WebDAVサーバに接続・認証できませんでした")

        const audioFiles = (await client.getDirectoryContents(
          folderPath
        )) as unknown as WebDAVDirectoryContent[]
        const audioFilesFiltered = audioFiles.filter(
          audioFile =>
            audioFile.type === "file" &&
            audioFile.basename.toLowerCase().includes(keyword.toLowerCase()) &&
            (audioFile.basename.endsWith(".mp3") ||
              audioFile.basename.endsWith(".m4a") ||
              audioFile.basename.endsWith(".flac") ||
              audioFile.basename.endsWith(".wav"))
        )

        return audioFilesFiltered
      } catch (e) {
        console.log(`🟥ERROR: ${e}`)
        throw new Error(
          `WebDAVサーバーのフォルダーに含まれるトラック一覧の取得に失敗しました (folderPath: ${folderPath})`
        )
      }
    },
    [getClient]
  )

  const getTrackInfo = useCallback(
    async (fileInfo: WebDAVDirectoryContent) => {
      try {
        const client = getClient()
        if (!client) throw new Error("WebDAVサーバに接続・認証できませんでした")

        const file = (await client.getFileContents(fileInfo.filename)) as Buffer

        const mimeType = getMimeType(fileInfo.filename)

        const { common } = await parseBuffer(new Uint8Array(file), mimeType)

        const id = client.getFileDownloadLink(fileInfo.filename)
        const imgSrc = common.picture
          ? `data:${
              common.picture[0].format
            };base64,${common.picture[0].data.toString("base64")}`
          : undefined

        const trackInfo: TrackWithPath = {
          id,
          path: fileInfo.filename,
          provider: "webdav",
          title: common.title || "",
          albumTitle: common.album || "",
          artist: common.artists ? common.artists.join("・") : "",
          image: imgSrc
            ? {
                src: imgSrc,
                height: 0, // expandTrackInfoで取得する
                width: 0 // expandTrackInfoで取得する
              }
            : undefined,
          duration: 0 // expandTrackInfoで取得する
        }

        const expandedTrackInfo = await expandTrackInfo(trackInfo)
        return expandedTrackInfo as TrackWithPath
      } catch (e) {
        console.log(`🟥ERROR: ${e}`)
        throw new Error(
          `WebDAVサーバーのフォルダーに含まれるトラック情報の取得に失敗しました (filepath: ${fileInfo.filename})`
        )
      }
    },
    [getClient]
  )

  const searchTracks = useCallback(
    async (folderPaths: string[], keyword: string) => {
      try {
        const foldersTracksInformations = await Promise.all(
          folderPaths.map(folderPath => getFolderTracks(folderPath, keyword))
        )
        const flattenFoldersTracksInformations =
          foldersTracksInformations.flat()

        const tracksInformations = await Promise.all(
          flattenFoldersTracksInformations.map(fileInfo =>
            getTrackInfo(fileInfo)
          )
        )

        return tracksInformations.map(trackWithPath =>
          removePathProperty(trackWithPath)
        )
      } catch (e) {
        console.log(`🟥ERROR: ${e}`)
        throw new Error(
          "WebDAVサーバーのフォルダーに含まれるトラックの検索に失敗しました"
        )
      }
    },
    [getFolderTracks, getTrackInfo]
  )

  return {
    isServerConnectionValidWithAuthConfig,
    isServerConnectionValid,
    checkIsFolderExists,
    getFolderTracks,
    getTrackInfo,
    searchTracks
  } as const
}

export default useWebDAVServer
