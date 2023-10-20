import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"

export interface UserData {
  [FIRESTORE_DOCUMENT_KEYS.DECRYPTION_VERIFY_STRING]: string
  [FIRESTORE_DOCUMENT_KEYS.SPOTIFY_REFRESH_TOKEN]?: string | undefined
  // TODO: フィールド追加する
}

export type UserDataKey =
  (typeof FIRESTORE_DOCUMENT_KEYS)[keyof typeof FIRESTORE_DOCUMENT_KEYS]
