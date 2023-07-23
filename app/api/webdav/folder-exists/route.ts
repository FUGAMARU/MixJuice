import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createWebDAVClient } from "@/utils/createWebDAVClient"

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get("path") as string

  const client = createWebDAVClient(headers())

  const responseHeaders = {
    "Access-Control-Allow-Origin": process.env
      .ACCESS_CONTROL_ALLOW_ORIGIN as string,
    "Access-Control-Allow-Methods": process.env
      .ACCESS_CONTROL_ALLOW_METHODS as string,
    "Access-Control-Allow-Headers": process.env
      .ACCESS_CONTROL_ALLOW_HEADERS as string
  }

  if (client === undefined) {
    return NextResponse.json("", { status: 401, headers: responseHeaders })
  }

  if (!(await client.exists(path))) {
    return NextResponse.json("", { status: 404, headers: responseHeaders })
  }

  return NextResponse.json("", { status: 200, headers: responseHeaders })
}
