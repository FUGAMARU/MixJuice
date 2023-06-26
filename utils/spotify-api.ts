import axios from "axios"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { Pkce } from "@/types/Pkce"

/** 参考: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow */

/** Code Verifierの生成 */
export const generateRandomString = (length: number) => {
  let text = ""
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

/** Code Challengeの生成 */
export const generateCodeChallenge = async (codeVerifier: string) => {
  const base64urlEncode = (str: string) =>
    btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await window.crypto.subtle.digest("SHA-256", data)

  return base64urlEncode(
    Array.from(new Uint8Array(digest))
      .map(byte => String.fromCharCode(byte))
      .join("")
  )
}

export const getCode = async (clientId: string, redirectUri: string) => {
  const codeVerifier = generateRandomString(128)
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  const state = generateRandomString(16)
  const scope =
    "user-read-private user-read-email playlist-read-private playlist-read-collaborative"

  localStorage.setItem(
    LOCAL_STORAGE_KEYS.PKCE_CONFIG,
    JSON.stringify({ codeVerifier, clientId, redirectUri } as Pkce)
  )

  return new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
    state,
    code_challenge_method: "S256",
    code_challenge: codeChallenge
  })
}

export const getAccessToken = async (code: string) => {
  const pkce = localStorage.getItem(LOCAL_STORAGE_KEYS.PKCE_CONFIG)

  if (pkce === null)
    throw Error("アクセストークン取得に必要な情報が存在しません")

  const { clientId, redirectUri, codeVerifier } = JSON.parse(pkce) as Pkce

  localStorage.setItem(LOCAL_STORAGE_KEYS.SPOTIFY_CLIENT_ID, clientId)

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
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

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN,
      res.data.access_token
    )
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PKCE_CONFIG)
  } catch (e) {
    throw Error("アクセストークンの取得に失敗しました")
  }
}
