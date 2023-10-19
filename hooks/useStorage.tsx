import CryptoJS from "crypto-js"
import { setDoc, doc, getDoc, deleteField, updateDoc } from "firebase/firestore"
import { useCallback, useMemo } from "react"

import { useAuthState } from "react-firebase-hooks/auth"
import useErrorModal from "./useErrorModal"
import {
  FIRESTORE_USERDATA_COLLECTION_NAME,
  FIRESTORE_DOCUMENT_KEYS
} from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { UserData, UserDataKey } from "@/types/UserData"
import { auth, db } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

const useStorage = () => {
  const { showError } = useErrorModal()
  const [user] = useAuthState(auth)

  const decryptionVerifyString = useMemo(
    () => process.env.NEXT_PUBLIC_DECRYPTION_VERIFY_STRING,
    []
  )

  const encryptText = useCallback((text: string) => {
    const key = localStorage.getItem(LOCAL_STORAGE_KEYS.DATA_DECRYPTION_KEY)
    if (!isDefined(key))
      throw new Error(
        "共通鍵がLocalStorageに存在しません。再ログインしてください。"
      ) // TODO: モーダルのボタン押したらログインフォームに飛ばされる独自例外に置き換える

    return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text), key).toString()
  }, [])

  const decryptText = useCallback((cipherText: string) => {
    const key = localStorage.getItem(LOCAL_STORAGE_KEYS.DATA_DECRYPTION_KEY)
    if (!isDefined(key))
      throw new Error(
        "共通鍵がLocalStorageに存在しません。再ログインしてください。"
      ) // TODO: モーダルのボタン押したらログインフォームに飛ばされる独自例外に置き換える

    return CryptoJS.AES.decrypt(cipherText, key).toString(CryptoJS.enc.Utf8)
  }, [])

  const createNewHashedPassword = useCallback((password: string) => {
    const hash = CryptoJS.SHA256(password).toString()
    localStorage.setItem(LOCAL_STORAGE_KEYS.DATA_DECRYPTION_KEY, hash)
  }, [])

  const createNewUserDocument = useCallback(
    async (email: string) => {
      if (!isDefined(decryptionVerifyString))
        throw new Error(
          "データーの復号化検証に必要な環境変数 NEXT_PUBLIC_DECRYPTION_VERIFY_STRING が設定されていません。サーバー管理者にお問い合わせください。"
        )

      const encryptedDecryptionVerifyString = encryptText(
        decryptionVerifyString
      )

      const userData: UserData = {
        [FIRESTORE_DOCUMENT_KEYS.DECRYPTION_VERIFY_STRING]:
          encryptedDecryptionVerifyString
      }

      await setDoc(doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email), userData)
    },
    [encryptText, decryptionVerifyString]
  )

  /** getUserDataやupdateUserなどの関数は、その関数の使用箇所で関数自体をtry/catchでラップするのが正しいのだろうが、コードが汚くなる気がするのでここで処理してしまうことにする */

  const getUserData = useCallback(
    async (key: UserDataKey) => {
      try {
        const email = user?.email
        if (!isDefined(email))
          throw new Error(
            "ログイン中ユーザーのメールアドレスを取得できませんでした"
          )

        if (!isDefined(decryptionVerifyString))
          throw new Error(
            "データーの復号化検証に必要な環境変数 NEXT_PUBLIC_DECRYPTION_VERIFY_STRING が設定されていません。サーバー管理者にお問い合わせください。"
          )

        const userDataDocument = await getDoc(
          doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email)
        )

        if (!userDataDocument.exists())
          throw new Error("ユーザーデーターが存在しません")

        if (!userDataDocument.data()?.[key]) return undefined // keyで指定されたフィールドが存在しない場合はundefinedを返す

        const encryptedUserData = userDataDocument.data() as UserData // TODO: withConverter使って型に強くしたい
        const decryptedVerifyString = decryptText(
          encryptedUserData[FIRESTORE_DOCUMENT_KEYS.DECRYPTION_VERIFY_STRING]
        )

        if (decryptionVerifyString !== decryptedVerifyString)
          throw new Error(
            "データーの復号化検証に失敗しました。再ログインしてください。"
          ) // TODO: モーダルのボタン押したらログインフォームに飛ばされる独自例外に置き換える

        return decryptText(encryptedUserData[key] as string)
      } catch (e) {
        showError(e)
      }
    },
    [showError, decryptText, user, decryptionVerifyString]
  )

  const updateUserData = useCallback(
    async (key: UserDataKey, value: string) => {
      try {
        const email = user?.email
        if (!isDefined(email))
          throw new Error(
            "ログイン中ユーザーのメールアドレスを取得できませんでした"
          )

        if (!isDefined(decryptionVerifyString))
          throw new Error(
            "データーの復号化検証に必要な環境変数 NEXT_PUBLIC_DECRYPTION_VERIFY_STRING が設定されていません。サーバー管理者にお問い合わせください。"
          )

        const data = {
          [key]: encryptText(value)
        }

        await updateDoc(
          doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email),
          data
        )
      } catch (e) {
        showError(e)
      }
    },
    [encryptText, showError, user, decryptionVerifyString]
  )

  const deleteUserData = useCallback(
    async (key: UserDataKey) => {
      try {
        const email = user?.email
        if (!isDefined(email))
          throw new Error(
            "ログイン中ユーザーのメールアドレスを取得できませんでした"
          )

        await updateDoc(doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email), {
          [key]: deleteField()
        })
      } catch (e) {
        showError(e)
      }
    },
    [showError, user]
  )

  return {
    createNewHashedPassword,
    createNewUserDocument,
    getUserData,
    updateUserData,
    deleteUserData
  } as const
}

export default useStorage
