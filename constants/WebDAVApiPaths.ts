export const WEBDAV_API_PATHS = {
  CHECK_AUTH: "/api/webdav/check-auth", // WebDAVサーバーに接続可能かどうかを確認する | POST | { address: string, user: string, password: string } => { status: number }
  FOLDER_EXISTS: "/api/webdav/folder-exists" // 指定したフォルダーが存在するかどうかを確認する | GET | { path: string } => { status: number }
}
