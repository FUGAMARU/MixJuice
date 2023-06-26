import axios, { isAxiosError } from "axios"
import { generateCodeChallenge, generateRandomString } from "@/utils/pkce"

export const getCode = async (clientId: string, redirectUri: string) => {
  const codeVerifier = generateRandomString(128)
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  const state = generateRandomString(16)
  const scope =
    "user-read-private user-read-email playlist-read-private playlist-read-collaborative"

  const tmp = {
    code_verifier: codeVerifier,
    client_id: clientId,
    redirect_uri: redirectUri
  }
  localStorage.setItem("tmp", JSON.stringify(tmp))

  return new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: state,
    code_challenge_method: "S256",
    code_challenge: codeChallenge
  })
}

export const getAccessToken = async (code: string) => {
  const tmp = localStorage.getItem("tmp")

  if (tmp === null)
    throw Error("アクセストークン取得に必要な情報が存在しません")

  const {
    client_id: clientId,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier
  } = JSON.parse(tmp)

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier
  })

  try {
    const res = await axios.post("/spotify-token", body, {
      headers: {
        ContentType: "application/x-www-form-urlencoded"
      }
    })

    localStorage.setItem("spotify_access_token", res.data.access_token)
  } catch (e) {
    if (
      isAxiosError(e) &&
      e.response?.data.error_description === "Invalid authorization code"
    )
      return // 何故かアクセストークンの取得処理が2回走るので、このエラーだけはスルーする。

    throw Error("アクセストークンの取得に失敗しました")
  }
}
