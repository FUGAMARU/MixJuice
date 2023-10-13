import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/** 参考: https://blog.s2n.tech/articles/nextjs-app-dir-csp */
const middleware = (req: NextRequest): NextResponse | void => {
  // Nonceの生成
  const nonce = generateNonce()
  // CSPヘッダの生成
  const csp = generateCspHeader(nonce)

  // リクエストヘッダを取得
  const headers = new Headers(req.headers)

  // コンポーネント側で取得できるようにリクエストヘッダにも設定
  headers.set("X-CSP-Nonce", nonce)
  // Next.jsが差し込むインラインスクリプトにもNonceが設定されるようにリクエストヘッダにもCSPを設定
  headers.set("Content-Security-Policy", csp)

  // 改変したリクエストヘッダをNextResponseに渡す
  const response = NextResponse.next({
    request: {
      headers
    }
  })

  // レスポンスヘッダにCSPを設定
  response.headers.set("Content-Security-Policy", csp)

  return response
}

// Nonceのビット長
// 参考: https://w3c.github.io/webappsec-csp/#security-nonces
const NONCE_BIT_LENGTH = 128

// Nonceの生成
// Node.jsのAPIは利用できないので、Web Crypto APIを使用
const generateNonce = (): string => {
  return bufferToHex(
    crypto.getRandomValues(new Uint8Array(NONCE_BIT_LENGTH / 8))
  )
}

// CSPヘッダの生成
const generateCspHeader = (nonce: string): string => {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "https:",
    "http:",
    // 開発環境ではevalを許可
    process.env.NODE_ENV === "development" && "'unsafe-eval'",
    `'nonce-${nonce}'`,
    // Twitterの埋め込みやGoogle Tag Managerを使っている場合は適宜設定
    //"https://www.googletagmanager.com",
    //"https://platform.twitter.com"
    "'strict-dynamic'"
  ]
    .filter(Boolean)
    .join(" ")

  // CSPの設定
  // 自分のサイトの状況に応じて適宜設定
  const csp = [
    "object-src 'none'",
    "base-uri 'none'",
    `script-src ${scriptSrc}`
  ].join("; ")

  return csp
}

// ArrayBufferを16進数の文字列に変換する
const bufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("")
}

export default middleware
