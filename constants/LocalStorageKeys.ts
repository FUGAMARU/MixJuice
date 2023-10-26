export const LOCAL_STORAGE_KEYS = {
  LOCAL_STORAGE_DATA_FORMAT_VERSION: "localStorageDataFormatVersion", // ローカルストレージのデータフォーマットのバージョン。FireStore対応などph2に上がったときに変更する。
  SPOTIFY_SELECTED_PLAYLISTS: "spotifySelectedPlaylists", // MixJuiceで使用するSpotifyプレイリストのID一覧
  NAVBAR_CHECKED_ITEMS: "navbarCheckedItems", // Navbarでチェックされているアイテムの一覧
  NAVBAR_DRAGGED_WIDTH: "navbarDraggedWidth", // Navbarの幅をドラッグで変更した際の幅
  WEBDAV_FOLDER_PATHS: "webdavFolderPaths", // MixJuiceで利用する用に指定されたWebDAVサーバー上のフォルダーのパス一覧,
  VOLUME: "volume", // 音量
  DATA_DECRYPTION_KEY: "dataDecryptionKey", // データーの復号化に使用するキー
  SETTINGS: "settings" // 設定
} as const
