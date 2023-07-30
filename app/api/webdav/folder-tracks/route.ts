import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { WebDAVDirectoryContent } from "@/types/WebDAVDirectoryContent"
import { createWebDAVClient } from "@/utils/createWebDAVClient"

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const folderPath = searchParams.get("folderPath") as string

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

  const audioFiles = (await client.getDirectoryContents(
    folderPath
  )) as unknown as WebDAVDirectoryContent[]
  const audioFilesFiltered = audioFiles.filter(
    audioFile =>
      audioFile.type === "file" &&
      (audioFile.basename.endsWith(".mp3") ||
        audioFile.basename.endsWith(".m4a") ||
        audioFile.basename.endsWith(".flac"))
  )

  return NextResponse.json(audioFilesFiltered, {
    status: 200,
    headers: responseHeaders
  })
}
