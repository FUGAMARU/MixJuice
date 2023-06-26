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
