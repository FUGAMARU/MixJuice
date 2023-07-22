import { NextRequest, NextResponse } from "next/server"
import { createClient } from "webdav"

export const POST = async (req: NextRequest) => {
  const { address, user, password, path } = await req.json()

  const client = createClient(address, {
    username: user,
    password: password
  })

  if (!(await client.exists(path))) {
    return NextResponse.json("", { status: 401 })
  }

  return NextResponse.json("", { status: 200 })
}
