import { parseStream } from "music-metadata"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { Track } from "@/types/Track"
import { WebDAVDirectoryContent } from "@/types/WebDAVDirectoryContent"
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

  const audioFiles = (await client.getDirectoryContents(
    path
  )) as unknown as WebDAVDirectoryContent[]
  const audioFilesFiltered = audioFiles.filter(
    audioFile =>
      audioFile.type === "file" && audioFile.basename.endsWith(".mp3") // TODO: 対応フォーマット増やす
  )

  const tracks: Track[] = await Promise.all(
    audioFilesFiltered.map(async audioFile => {
      const filepath = `${path}/${audioFile.basename}`

      const stream = client.createReadStream(filepath)
      const { common } = await parseStream(
        stream,
        { mimeType: "audio/mpeg", size: audioFile.size },
        { duration: true }
      )
      stream.destroy()

      const id = await client.getFileDownloadLink(filepath)
      const imgSrc = common.picture
        ? `data:${
            common.picture[0].format
          };base64,${common.picture[0].data.toString("base64")}`
        : ""

      return {
        id,
        provider: "webdav",
        title: common.title || "",
        albumTitle: common.album || "",
        artist: common.artists ? common.artists.join(", ") : "",
        imgSrc,
        imgHeight: 0, // クライアント側で情報を付与する
        imgWidth: 0, // クライアント側で情報を付与する
        duration: 0 // parseStreamから取得できるが、undefined許容のため、クライアント側にて確実に曲の長さを取得する
      }
    })
  )

  return NextResponse.json(tracks, {
    status: 200,
    headers: responseHeaders
  })
}
