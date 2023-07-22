import { NextRequest, NextResponse } from "next/server"
import { createClient } from "webdav"

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
