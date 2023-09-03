export const LOCAL_STORAGE_KEYS = {
  NAVBAR_CHECKED_ITEMS: "navbarCheckedItems", // Navbarでチェックされているアイテムの一覧
  NAVBAR_DRAGGED_WIDTH: "navbarDraggedWidth", // Navbarの幅をドラッグで変更した際の幅
  PKCE_CONFIG: "pkceConfig", // SpotifyのPKCE認証フローで使用する情報
  SPOTIFY_CLIENT_ID: "spotifyClientId", // Spotify APIを利用する際のクライアントID
  SPOTIFY_ACCESS_TOKEN: "spotifyAccessToken", // Spotify APIを利用する際のアクセストークン TODO: このまま使わないようであれば削除
  SPOTIFY_REFRESH_TOKEN: "spotifyRefreshToken", // Spotify APIを利用する際のリフレッシュトークン
  SPOTIFY_ACCESS_TOKEN_EXPIRES_AT: "spotifyAccessTokenExpiresAt", // Spotify APIを利用する際のアクセストークンの有効期限 TODO: このまま使わないようであれば削除
  SPOTIFY_SELECTED_PLAYLISTS: "spotifySelectedPlaylists", // MixJuiceで使用するSpotifyプレイリストのID一覧
  WEBDAV_ADDRESS: "webdavAddress", // WebDAVサーバーのアドレス
  WEBDAV_USER: "webdavUser", // WebDAVサーバーのユーザー名
  WEBDAV_PASSWORD: "webdavPassword", // WebDAVサーバーのパスワード,
  WEBDAV_IS_AUTHENTICATED: "webdavIsAuthenticated", // WebDAVサーバーに認証済みかどうか
  WEBDAV_FOLDER_PATHS: "webdavFolderPaths" // MixJuiceで利用する用に指定されたWebDAVサーバー上のフォルダーのパス一覧
}
