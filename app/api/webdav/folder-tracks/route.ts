import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import * as NodeID3 from "node-id3"
import { Track } from "@/types/Track"
import { WebDAVDirectoryContent } from "@/types/WebDAVDirectoryContent"
import { arrayBufferToBinaryString } from "@/utils/arrayBufferToBinaryString"
import { createWebDAVClient } from "@/utils/createWebDAVClient"

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get("path") as string

  const client = createWebDAVClient(headers())

  if (client === undefined) {
    return NextResponse.json("", { status: 401 })
  }

  const audioFiles = (await client.getDirectoryContents(
    path
  )) as unknown as WebDAVDirectoryContent[]
  const audioFilesFiltered = audioFiles.filter(
    audioFile =>
      audioFile.type === "file" && audioFile.basename.endsWith(".mp3") // ID-3タグを取れるのがmp3だけなのでmp3に限定
  )

  const tracks: Track[] = await Promise.all(
    audioFilesFiltered.map(async audioFile => {
      const filepath = `${path}/${audioFile.basename}`

      const downloadLink = await client.getFileDownloadLink(filepath)

      const content = (await client.getFileContents(filepath)) as Buffer
      const tags = NodeID3.read(content)

      const image = tags.image
      let imgSrc: string = ""
      if (typeof image === "undefined" || typeof image === "string") {
        imgSrc = ""
      } else {
        const base64 = arrayBufferToBinaryString(image.imageBuffer)
        const encodedData = Buffer.from(base64, "binary").toString("base64")
        imgSrc = `data:${image.mime};base64,${encodedData}`
      }

      return {
        id: downloadLink,
        provider: "webdav",
        title: tags.title || "???",
        albumTitle: tags.album || "???",
        artist: tags.artist || "???",
        imgSrc,
        imgHeight: 0, // クライアント側で情報を付与する
        imgWidth: 0, // クライアント側で情報を付与する
        duration: 0 // クライアント側で情報を付与する
      }
    })
  )

  return NextResponse.json(tracks, { status: 200 })
}
