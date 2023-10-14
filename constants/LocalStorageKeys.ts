export const LOCAL_STORAGE_KEYS = {
  LOCAL_STORAGE_DATA_FORMAT_VERSION: "localStorageDataFormatVersion", // ローカルストレージのデータフォーマットのバージョン。FireStore対応などph2に上がったときに変更する。
  NAVBAR_CHECKED_ITEMS: "navbarCheckedItems", // Navbarでチェックされているアイテムの一覧
  NAVBAR_DRAGGED_WIDTH: "navbarDraggedWidth", // Navbarの幅をドラッグで変更した際の幅
  SPOTIFY_CLIENT_ID: "spotifyClientId", // Spotify APIを利用する際のクライアントID
  SPOTIFY_REFRESH_TOKEN: "spotifyRefreshToken", // Spotify APIを利用する際のリフレッシュトークン
  SPOTIFY_SELECTED_PLAYLISTS: "spotifySelectedPlaylists", // MixJuiceで使用するSpotifyプレイリストのID一覧
  WEBDAV_ADDRESS: "webdavAddress", // WebDAVサーバーのアドレス
  WEBDAV_USER: "webdavUser", // WebDAVサーバーのユーザー名
  WEBDAV_PASSWORD: "webdavPassword", // WebDAVサーバーのパスワード,
  WEBDAV_IS_AUTHENTICATED: "webdavIsAuthenticated", // WebDAVサーバーに認証済みかどうか
  WEBDAV_FOLDER_PATHS: "webdavFolderPaths", // MixJuiceで利用する用に指定されたWebDAVサーバー上のフォルダーのパス一覧,
  DATA_DECRYPTION_KEY: "dataDecryptionKey" // データーの復号化に使用するキー
} as const
