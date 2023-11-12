import { parseBuffer } from "music-metadata-browser"
import { useCallback } from "react"
import { AuthType, createClient } from "webdav"
import useLogger from "./useLogger"
import useStorage from "./useStorage"
import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"
import { TrackWithPath, removePathProperty } from "@/types/Track"
import { WebDAVDirectoryContent } from "@/types/WebDAVDirectoryContent"
import { WebDAVServerCredentials } from "@/types/WebDAVServerCredentials"
import { expandTrackInfo } from "@/utils/expandTrackInfo"
import { getMimeType } from "@/utils/getMimeType"
import { isDefined } from "@/utils/isDefined"

const useWebDAVServer = () => {
  const showLog = useLogger()
  const { userData } = useStorage({ initialize: false })

  const getClient = useCallback(() => {
    if (!isDefined(userData)) return undefined

    const webdavServerCredentials =
      userData[FIRESTORE_DOCUMENT_KEYS.WEBDAV_SERVER_CREDENTIALS]

    if (!isDefined(webdavServerCredentials)) return undefined

    const { address, user, password } = JSON.parse(
      webdavServerCredentials
    ) as WebDAVServerCredentials

    return createClient(address as string, {
      authType: AuthType.Password,
      username: user as string,
      password: password as string
    })
  }, [userData])

  const tryServerConnection = useCallback(
    async (address: string, username: string, password: string) => {
      try {
        // この時点ではまだLocalStorageに認証情報がないので認証情報は引数として受け取る
        await createClient(address, {
          username,
          password
        }).getQuota()
      } catch (e) {
        showLog("error", e)
        throw new Error(
          "指定された認証情報でWebDAVサーバに接続・認証できませんでした"
        )
      }
    },
    [showLog]
  )

  const checkIsFolderExists = useCallback(
    async (folderPath: string) => {
      const client = getClient()
      if (!client) return false

      try {
        const isExists = await client.exists(folderPath)
        return isExists
      } catch (e) {
        showLog("error", e)
        return false
      }
    },
    [getClient, showLog]
  )

  /** 1. LocalStorageにWebDAVサーバーへの接続情報が記録されているか
   * 2. LocalStorageに記録されている接続情報を用いて実際にWebDAVサーバーに接続できるか
   * 3. 指定されたパスのフォルダーやファイルがWebDAVサーバー上に存在するか
   * を確認する。もしいずれかのチェックに引っかかった場合は例外を投げる
   */
  const checkServerConnectionRoutine = useCallback(
    async (path?: string) => {
      const client = getClient()
      if (!client)
        throw new Error("WebDAVサーバーの接続情報が設定されていません")

      try {
        await client.getQuota()
      } catch (e) {
        showLog("error", e)
        throw new Error(
          "設定されている認証情報でWebDAVサーバに接続・認証できませんでした"
        )
      }

      if (!path) return // パスが指定されている場合のみ存在確認を行う

      const isExists = await client.exists(path)
      if (!isExists)
        throw new Error(
          `WebDAVサーバー上に指定されたフォルダーが存在しませんでした (folderPath: ${path})`
        )
    },
    [getClient, showLog]
  )

  const getFolderTracks = useCallback(
    async (folderPath: string, keyword: string) => {
      try {
        const client = getClient()
        if (!client)
          throw new Error("WebDAVサーバーの接続情報が設定されていません")

        await checkServerConnectionRoutine(folderPath)

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
        showLog("error", e)
        throw new Error(
          `WebDAVサーバーのフォルダーに含まれるトラック一覧の取得に失敗しました (folderPath: ${folderPath})`
        )
      }
    },
    [getClient, checkServerConnectionRoutine, showLog]
  )

  const getTrackInfo = useCallback(
    async (fileInfo: WebDAVDirectoryContent) => {
      try {
        const client = getClient()
        if (!client)
          throw new Error("WebDAVサーバーの接続情報が設定されていません")

        await checkServerConnectionRoutine(fileInfo.filename)

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
          title: common.title || "不明なタイトル",
          albumTitle: common.album || "不明なアルバム",
          artist: common.artists
            ? common.artists.join("・")
            : "不明なアーティスト",
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
        showLog("error", e)
        throw new Error(
          `WebDAVサーバーのフォルダーに含まれるトラック情報の取得に失敗しました (filepath: ${fileInfo.filename})`
        )
      }
    },
    [getClient, checkServerConnectionRoutine, showLog]
  )

  const searchTracksByFilename = useCallback(
    async (folderPaths: string[], keyword: string) => {
      try {
        await checkServerConnectionRoutine()

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
        showLog("error", e)
        throw new Error(
          "WebDAVサーバーのフォルダーに含まれるトラックの検索に失敗しました"
        )
      }
    },
    [getFolderTracks, getTrackInfo, checkServerConnectionRoutine, showLog]
  )

  return {
    tryServerConnection,
    checkServerConnectionRoutine,
    checkIsFolderExists,
    getFolderTracks,
    getTrackInfo,
    searchTracksByFilename
  } as const
}

export default useWebDAVServer
