import { parseStream } from "music-metadata"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { Track } from "@/types/Track"
import { WebDAVDirectoryContent } from "@/types/WebDAVDirectoryContent"
import { createWebDAVClient } from "@/utils/createWebDAVClient"
import { getMimeType } from "@/utils/getMimeType"

export const POST = async (req: NextRequest) => {
  const { folderPaths, keyword } = await req.json()

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

  const keywordFilteredAudioFiles = await Promise.all(
    folderPaths.map(async (folderPath: string) => {
      const audioFiles = (await client.getDirectoryContents(
        folderPath
      )) as unknown as WebDAVDirectoryContent[]

      const audioFilesFiltered = audioFiles.filter(
        audioFile =>
          audioFile.type === "file" &&
          audioFile.basename.toLowerCase().includes(keyword.toLowerCase()) && // 未キャッシュのWebDAVファイルを検索する場合、ここでキーワードのフィルタリングを掛けないと、folderPathsで指定されているフォルダー内の全楽曲のメタデーターを読んでからフィルタリングすることになる。(=未キャッシュの場合ファイル名による検索しかできない)
          (audioFile.basename.endsWith(".mp3") ||
            audioFile.basename.endsWith(".m4a") ||
            audioFile.basename.endsWith(".flac") ||
            audioFile.basename.endsWith(".wav"))
      )

      return audioFilesFiltered
    })
  )

  const tracks: Track[] = await Promise.all(
    keywordFilteredAudioFiles
      .flat()
      .map(async (trackInfo: WebDAVDirectoryContent) => {
        const stream = client.createReadStream(trackInfo.filename)

        const mimeType = getMimeType(trackInfo.filename)

        const { common } = await parseStream(
          stream,
          { mimeType, size: trackInfo.size },
          { duration: true }
        )
        stream.destroy()

        const id = client.getFileDownloadLink(trackInfo.filename)
        const imgSrc = common.picture
          ? `data:${
              common.picture[0].format
            };base64,${common.picture[0].data.toString("base64")}`
          : undefined

        return {
          id,
          provider: "webdav",
          title: common.title || "",
          albumTitle: common.album || "",
          artist: common.artists ? common.artists.join(", ") : "",
          image: imgSrc
            ? {
                src: imgSrc,
                height: 0, // クライアント側で情報を付与する
                width: 0 // クライアント側で情報を付与する
              }
            : undefined,
          duration: 0 // parseStreamから取得できるが、undefined許容のため、クライアント側にて確実に曲の長さを取得する
        } as Track
      })
  )

  return NextResponse.json(tracks, {
    status: 200,
    headers: responseHeaders
  })
}
