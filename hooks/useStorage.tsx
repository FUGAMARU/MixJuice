import CryptoJS from "crypto-js"
import { setDoc, doc } from "firebase/firestore"
import { useCallback } from "react"

import {
  FIRESTORE_USERDATA_COLLECTION_NAME,
  FIRESTORE_DOCUMENT_KEYS
} from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { UserData } from "@/types/UserData"
import { db } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

const useStorage = () => {
  const encryptText = useCallback((text: string) => {
    const key = localStorage.getItem(LOCAL_STORAGE_KEYS.DATA_DECRYPTION_KEY)
    if (!isDefined(key)) throw new Error("共通鍵がLocalStorageに存在しません")

    return CryptoJS.AES.encrypt(text, key).toString()
  }, [])

  const createNewHashedPassword = useCallback((password: string) => {
    const hash = CryptoJS.SHA256(password).toString()
    localStorage.setItem(LOCAL_STORAGE_KEYS.DATA_DECRYPTION_KEY, hash)
  }, [])

  const createNewUserDocument = useCallback(
    async (email: string, decryptionVerifyString: string) => {
      const encryptedDecryptionVerifyString = encryptText(
        decryptionVerifyString
      )

      const userData: UserData = {
        [FIRESTORE_DOCUMENT_KEYS.DECRYPTION_VERIFY_STRING]:
          encryptedDecryptionVerifyString
      }

      await setDoc(doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email), userData)
    },
    [encryptText]
  )

  return { createNewHashedPassword, createNewUserDocument } as const
}

export default useStorage
