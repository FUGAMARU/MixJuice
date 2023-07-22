import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createWebDAVClient } from "@/utils/createWebDAVClient"

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get("path") as string

  const client = createWebDAVClient(headers())

  if (client === undefined) {
    return NextResponse.json("", { status: 401 })
  }

  if (!(await client.exists(path))) {
    return NextResponse.json("", { status: 404 })
  }

  return NextResponse.json("", { status: 200 })
}
