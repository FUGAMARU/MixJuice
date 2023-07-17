"use client"

import axios from "axios"
import { useEffect } from "react"
import { useRecoilValue } from "recoil"
import { spotifyAccessTokenAtom } from "@/atoms/spotifyAccessTokenAtom"
import useSpotifyToken from "@/hooks/useSpotifyToken"

type Props = {
  children: React.ReactNode
}

export const spotifyApi = axios.create({
  baseURL: "/spotify-api",
  headers: {
    ContentType: "application/json"
  },
  responseType: "json"
})

let isNowRefreshingToken = false

/** SpotifyのAxios InstanceやInterceptorsなど */
const SpotifyDaemon = ({ children }: Props) => {
  const accessToken = useRecoilValue(spotifyAccessTokenAtom)
  const { refreshAccessToken, hasValidAccessTokenState } = useSpotifyToken()

  useEffect(() => {
    /** リクエストインターセプター */
    const requestInterceptor = spotifyApi.interceptors.request.use(
      async config => {
        /** リクエスト送信前処理 */

        /** アクセストークンの更新済みフラグの連携がうまくいなかった場合に連続でアクセストークンの更新作業が行われないようにするための緩衝材 */
        while (isNowRefreshingToken) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        /** accessTokenがundefined、もしくはoffsetを考慮した上でアクセストークンの有効期限を迎えた場合はリフレッシュトークンを用いてアクセストークンをリフレッシュする
         * accessTokenがundefinedになる例: Spotifyにログイン済みの状態で、新しくMixJuiceを開いた場合
         */
        if (!hasValidAccessTokenState) {
          try {
            isNowRefreshingToken = true
            const newAccessToken = await refreshAccessToken()
            config.headers.Authorization = `Bearer ${newAccessToken}`
            return config
          } catch (e) {
            return Promise.reject(e)
          } finally {
            isNowRefreshingToken = false
          }
        }

        config.headers.Authorization = `Bearer ${accessToken!.token}` // hasValidAccessTokenStateによりaccessTokenがundefinedではないことが保証されている
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
    const responseInterceptor = spotifyApi.interceptors.response.use(
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
      spotifyApi.interceptors.request.eject(requestInterceptor)
      spotifyApi.interceptors.response.eject(responseInterceptor)
    }
  }, [accessToken, refreshAccessToken, hasValidAccessTokenState])

  return <>{children}</>
}

export default SpotifyDaemon
