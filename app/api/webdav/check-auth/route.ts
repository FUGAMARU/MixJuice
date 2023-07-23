import { NextRequest, NextResponse } from "next/server"
import { createClient } from "webdav"

/** 認証情報が正しいかどうか不明な段階ではInterceptorsによってリクエストヘッダーに認証情報を含めることはできないので、check-authに関してはPOSTでリクエストして認証情報をパラメーターに含める形とする */
export const POST = async (req: NextRequest) => {
  const { address, user, password } = await req.json()

  const client = createClient(address, {
    username: user,
    password: password
  })

  const responseHeaders = {
    "Access-Control-Allow-Origin": process.env
      .ACCESS_CONTROL_ALLOW_ORIGIN as string,
    "Access-Control-Allow-Methods": process.env
      .ACCESS_CONTROL_ALLOW_METHODS as string,
    "Access-Control-Allow-Headers": process.env
      .ACCESS_CONTROL_ALLOW_HEADERS as string
  }

  try {
    await client.getQuota()
  } catch {
    return NextResponse.json("", { status: 401, headers: responseHeaders })
  }

  return NextResponse.json("", { status: 200, headers: responseHeaders })
}
