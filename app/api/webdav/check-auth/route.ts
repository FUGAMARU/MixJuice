import { NextRequest, NextResponse } from "next/server"
import { createClient } from "webdav"

/** 認証情報が正しいかどうか不明な段階ではInterceptorsによってリクエストヘッダーに認証情報を含めることはできないので、check-authに関してはPOSTでリクエストして認証情報をパラメーターに含める形とする */
export const POST = async (req: NextRequest) => {
  const { address, user, password } = await req.json()

  const client = createClient(address, {
    username: user,
    password: password
  })

  try {
    await client.getQuota()
  } catch {
    return NextResponse.json("", { status: 401 })
  }

  return NextResponse.json("", { status: 200 })
}
