import { parseStream } from "music-metadata"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { Track } from "@/types/Track"
import { WebDAVDirectoryContent } from "@/types/WebDAVDirectoryContent"
import { createWebDAVClient } from "@/utils/createWebDAVClient"

export const POST = async (req: NextRequest) => {
  const { folderTrackInfo } = await req.json()

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

  const tracks: Track[] = await Promise.all(
    folderTrackInfo.map(async (trackInfo: WebDAVDirectoryContent) => {
      const stream = client.createReadStream(trackInfo.filename)
      const { common } = await parseStream(
        stream,
        { mimeType: "audio/mpeg", size: trackInfo.size },
        { duration: true }
      )
      stream.destroy()

      const id = client.getFileDownloadLink(trackInfo.filename)
      const imgSrc = common.picture
        ? `data:${
            common.picture[0].format
          };base64,${common.picture[0].data.toString("base64")}`
        : ""

      return {
        id,
        path: trackInfo.filename,
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
