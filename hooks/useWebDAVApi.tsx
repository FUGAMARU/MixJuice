import axios from "axios"
import { useCallback, useEffect } from "react"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { Track, TrackWithPath } from "@/types/Track"
import { WebDAVDirectoryContent } from "@/types/WebDAVDirectoryContent"
import {
  expandTrackInfo,
  expandTrackInfoWithPath
} from "@/utils/expandTrackInfo"

export const webDAVApi = axios.create({
  baseURL: "/api/webdav",
  headers: {
    ContentType: "application/json"
  },
  responseType: "json"
})

type Props = {
  initialize: boolean
}

const useWebDAVApi = ({ initialize }: Props) => {
  useEffect(() => {
    if (!initialize) return

    /** リクエストインターセプター */
    const requestInterceptor = webDAVApi.interceptors.request.use(
      async config => {
        /** リクエスト送信前処理 */

        /** localStorageから認証情報を読み込んでリクエストヘッダーに含める */
        const address = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_ADDRESS)
        const user = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBDAV_USER)
        const password = localStorage.getItem(
          LOCAL_STORAGE_KEYS.WEBDAV_PASSWORD
        )

        if (address === null || user === null || password === null)
          return config

        config.headers.Authorization = JSON.stringify({
          address,
          user,
          password
        })
        return config
      },
      error => {
        /** リクエストエラーの処理 */
        console.log("🟥ERROR: リクエストエラー")
        console.log(error)
        return Promise.reject(error)
      }
    )

    /** レスポンスインターセプター */
    const responseInterceptor = webDAVApi.interceptors.response.use(
      response => {
        /** レスポンス正常 (ステータスコードが2xx) */
        return response
      },
      error => {
        /** レスポンス異常 (ステータスコードが2xx以外) */
        console.log("🟥ERROR: レスポンスエラー")
        console.log(error)
        return Promise.reject(error)
      }
    )

    return () => {
      webDAVApi.interceptors.request.eject(requestInterceptor)
      webDAVApi.interceptors.response.eject(responseInterceptor)
    }
  }, [initialize])

  const checkAuth = useCallback(
    async (address: string, user: string, password: string) => {
      try {
        await webDAVApi.post("/check-auth", {
          address,
          user,
          password
        })
      } catch (e) {
        console.log("🟥ERROR: ", e)
        throw Error("WebDAVサーバーへの接続に失敗しました")
      }
    },
    []
  )

  const checkIsFolderExists = useCallback(async (path: string) => {
    try {
      await webDAVApi.get("/folder-exists", {
        params: { path }
      })
    } catch (e) {
      console.log("🟥ERROR: ", e)
      throw Error("指定されたパスのフォルダーが存在しません")
    }
  }, [])

  const getFolderTracks = useCallback(async (folderPath: string) => {
    try {
      const res = await webDAVApi.get<WebDAVDirectoryContent[]>(
        "/folder-tracks",
        {
          params: { folderPath }
        }
      )
      return res.data
    } catch (e) {
      console.log("🟥ERROR: ", e)
      throw Error("フォルダー内の楽曲一覧の取得に失敗しました")
    }
  }, [])

  const getFolderTrackInfo = useCallback(
    async (folderTrackInfo: WebDAVDirectoryContent[]) => {
      try {
        const res = (
          await webDAVApi.post<TrackWithPath[]>("/folder-tracks-info", {
            folderTrackInfo
          })
        ).data

        const tracks: TrackWithPath[] = await Promise.all(
          res.map(async track => expandTrackInfoWithPath(track)) // TODO: await付ける必要あるかも？ 動作不安定になることがあったら修正
        )

        return tracks
      } catch (e) {
        console.log("🟥ERROR: ", e)
        throw Error("フォルダー内の楽曲情報の取得に失敗しました")
      }
    },
    []
  )

  const searchTracks = useCallback(
    async (folderPaths: string[], keyword: string) => {
      try {
        const res = await webDAVApi.post<Track[]>("/search-tracks", {
          folderPaths,
          keyword
        })

        const tracks: Track[] = await Promise.all(
          res.data.map(async track => expandTrackInfo(track)) // TODO: await付ける必要あるかも？ 動作不安定になることがあったら修正
        )

        return tracks
      } catch (e) {
        console.log("🟥ERROR: ", e)
        throw Error("楽曲の検索に失敗しました")
      }
    },
    []
  )

  return {
    checkAuth,
    checkIsFolderExists,
    getFolderTracks,
    getFolderTrackInfo,
    searchTracks
  } as const
}

export default useWebDAVApi
