export const FIRESTORE_USERDATA_COLLECTION_NAME = "userData" // ユーザーデーターを格納するコレクション名

export const FIRESTORE_DOCUMENT_KEYS = {
  DECRYPTION_VERIFY_STRING: "decryptionVerifyString", // データーの復号化の検証に使用するハッシュ化された文字列
  SPOTIFY_REFRESH_TOKEN: "spotifyRefreshToken" // Spotify APIを利用する際のリフレッシュトークン
} as const
