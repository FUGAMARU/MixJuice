export type WebDAVDirectoryContent = {
  filename: string
  basename: string
  lastmod: Date
  size: number
  type: "directory" | "file"
  etag: string
}
