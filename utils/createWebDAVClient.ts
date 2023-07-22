import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"
import { createClient } from "webdav"
import { WebDAVAuthInfo } from "@/types/WebDAVAuthInfo"

export const createWebDAVClient = (headers: ReadonlyHeaders) => {
  const authInfo = headers.get("Authorization")

  if (authInfo === null) return undefined

  const { address, user, password } = JSON.parse(authInfo) as WebDAVAuthInfo
  return createClient(address, {
    username: user,
    password: password
  })
}
