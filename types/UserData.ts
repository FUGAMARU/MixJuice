import { FIRESTORE_DOCUMENT_KEYS } from "@/constants/Firestore"

export interface UserData {
  [FIRESTORE_DOCUMENT_KEYS.DECRYPTION_VERIFY_STRING]: string
  // TODO: フィールド追加する
}
