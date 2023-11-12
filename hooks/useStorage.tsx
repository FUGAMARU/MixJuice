import CryptoJS from "crypto-js"
import {
  setDoc,
  doc,
  getDoc,
  deleteField,
  updateDoc,
  deleteDoc
} from "firebase/firestore"
import { useCallback, useEffect, useMemo } from "react"

import { useAuthState } from "react-firebase-hooks/auth"
import { useRecoilCallback, useRecoilState } from "recoil"
import useErrorModal from "./useErrorModal"
import useLogger from "./useLogger"
import useWebDAVTrackDatabase from "./useWebDAVTrackDatabase"
import { userDataAtom } from "@/atoms/userDataAtom"
import { UserDataOperationError } from "@/classes/UserDataOperationError"
import {
  FIRESTORE_USERDATA_COLLECTION_NAME,
  FIRESTORE_DOCUMENT_KEYS
} from "@/constants/Firestore"
import { LOCAL_STORAGE_KEYS } from "@/constants/LocalStorageKeys"
import { UserData, UserDataKey } from "@/types/UserData"
import { auth, db } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

type Args = { initialize: boolean }

const useStorage = ({ initialize }: Args) => {
  const showLog = useLogger()
  const { showError } = useErrorModal()
  const [userData, setUserData] = useRecoilState(userDataAtom)
  const [userInfo, isLoadingUserInfo] = useAuthState(auth)
  const { clearAllData } = useWebDAVTrackDatabase()

  const decryptionVerifyString = useMemo(
    () => process.env.NEXT_PUBLIC_DECRYPTION_VERIFY_STRING,
    []
  )

  const encryptText = useCallback((text: string) => {
    const key = localStorage.getItem(LOCAL_STORAGE_KEYS.DATA_DECRYPTION_KEY)
    if (!isDefined(key))
      throw new UserDataOperationError(
        "共通鍵がLocalStorageに存在しません。再ログインしてください。"
      )

    return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text), key).toString()
  }, [])

  const decryptText = useCallback((cipherText: string) => {
    const key = localStorage.getItem(LOCAL_STORAGE_KEYS.DATA_DECRYPTION_KEY)
    if (!isDefined(key))
      throw new UserDataOperationError(
        "共通鍵がLocalStorageに存在しません。再ログインしてください。"
      )

    return CryptoJS.AES.decrypt(cipherText, key).toString(CryptoJS.enc.Utf8)
  }, [])

  const setHashedPassword = useCallback((password: string) => {
    const hash = CryptoJS.SHA256(password).toString()
    localStorage.setItem(LOCAL_STORAGE_KEYS.DATA_DECRYPTION_KEY, hash)
  }, [])

  const setDecryptionVerifyString = useCallback(
    async (email: string) => {
      if (!isDefined(decryptionVerifyString))
        throw new Error(
          "データーの復号化検証に必要な環境変数 NEXT_PUBLIC_DECRYPTION_VERIFY_STRING が設定されていません。サーバー管理者にお問い合わせください。"
        )

      const encryptedDecryptionVerifyString = encryptText(
        decryptionVerifyString
      )

      await updateDoc(doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email), {
        [FIRESTORE_DOCUMENT_KEYS.DECRYPTION_VERIFY_STRING]:
          encryptedDecryptionVerifyString
      })
      showLog("warning", "Firestoreへの書き込みが発生しました")
    },
    [decryptionVerifyString, encryptText, showLog]
  )

  const createNewUserDocument = useCallback(
    async (email: string) => {
      if (!isDefined(decryptionVerifyString))
        throw new Error(
          "データーの復号化検証に必要な環境変数 NEXT_PUBLIC_DECRYPTION_VERIFY_STRING が設定されていません。サーバー管理者にお問い合わせください。"
        )

      const encryptedDecryptionVerifyString = encryptText(
        decryptionVerifyString
      )

      const userData = {
        [FIRESTORE_DOCUMENT_KEYS.DECRYPTION_VERIFY_STRING]:
          encryptedDecryptionVerifyString
      } satisfies UserData

      await setDoc(doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email), userData)
      showLog("warning", "Firestoreへの書き込みが発生しました")
    },
    [encryptText, decryptionVerifyString, showLog]
  )

  const updateUserData = useRecoilCallback(
    ({ snapshot, set }) =>
      async (key: UserDataKey, value: string) => {
        /** updateUserDataの使用箇所でupdateUserData自体をtry/catchしてしまうのが正しい実装なのだろうが、如何せん使用箇所が多くいちいちtry/cathcを書いているとコードが汚くなる気がするので例外処理はここで捌いてしまう */
        try {
          const email = userInfo?.email
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
          showLog("warning", "Firestoreへの書き込みが発生しました")

          const currentUserData = await snapshot.getPromise(userDataAtom)

          if (!isDefined(currentUserData))
            throw new Error("ユーザーデーターがundefinedです")
          const updatedUserData = { ...currentUserData, [key]: value }
          set(userDataAtom, updatedUserData)
        } catch (e) {
          showError(e)
        }
      },
    [encryptText, showError, userInfo, decryptionVerifyString]
  )

  const deleteUserDataWithKey = useCallback(
    async (key: UserDataKey) => {
      try {
        const email = userInfo?.email
        if (!isDefined(email))
          throw new Error(
            "ログイン中ユーザーのメールアドレスを取得できませんでした"
          )

        await updateDoc(doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email), {
          [key]: deleteField()
        })
        showLog("warning", "Firestoreへの書き込みが発生しました")

        if (!isDefined(userData))
          throw new Error("ユーザーデーターがundefinedです")
        const updatedUserData = { ...userData }
        delete updatedUserData[key]
        setUserData(updatedUserData)
      } catch (e) {
        showError(e)
      }
    },
    [showError, userInfo, userData, setUserData, showLog]
  )

  /** ユーザーのデーターを削除するのであってユーザードキュメント自体は削除しない */
  const deleteAllUserData = useCallback(
    async (email: string) => {
      await setDoc(doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email), {})
      showLog("warning", "Firestoreへの書き込みが発生しました")
      localStorage.removeItem(LOCAL_STORAGE_KEYS.DATA_DECRYPTION_KEY)
    },
    [showLog]
  )

  /** ユーザーが退会する時に使うやつ */
  const deleteUserData = useCallback(
    async (email: string) => {
      await deleteDoc(doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email))
      localStorage.clear()
      clearAllData()
    },
    [clearAllData]
  )

  const getCurrentUserData = useCallback(
    async (specifiedEmail?: string) => {
      const email = specifiedEmail ?? userInfo?.email
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
      showLog("warning", "Firestoreからの読み込みが発生しました")

      if (!userDataDocument.exists())
        throw new Error("ユーザーデーターが存在しません")

      const encryptedUserData = userDataDocument.data() as UserData // TODO: withConverter使って型に強くしたい
      const decryptedUserData = Object.fromEntries(
        Object.entries(encryptedUserData).map(([key, value]) => [
          key,
          decryptText(value as string)
        ])
      ) as unknown as UserData

      const decryptedVerifyString =
        decryptedUserData[FIRESTORE_DOCUMENT_KEYS.DECRYPTION_VERIFY_STRING]

      if (decryptionVerifyString !== decryptedVerifyString)
        throw new UserDataOperationError(
          "データーの復号化検証に失敗しました。再ログインしてください。"
        )

      return decryptedUserData
    },
    [decryptText, userInfo, decryptionVerifyString, showLog]
  )

  /** MixJuiceを起動した時にFirestoreのデーターをローカルのRecoilStateに取り込む */
  useEffect(() => {
    if (!initialize || !isDefined(userInfo) || isLoadingUserInfo) return
    if (userInfo.emailVerified === false)
      return // ユーザー登録直後はFirestoreから取得するべきデーターが無いのでスルー (逆にスルーしないとユーザー登録完了時にFirestoreにドキュメントが存在しない例外が発生する)
    ;(async () => {
      try {
        const userData = await getCurrentUserData()
        setUserData(userData)
        showLog(
          "success",
          "Firestore上のユーザーデータをRecoilStateに取り込みました"
        )
      } catch (e) {
        showError(e)
      }
    })()
  }, [
    initialize,
    userInfo,
    isLoadingUserInfo,
    setUserData,
    showError,
    getCurrentUserData,
    showLog
  ])

  return {
    setHashedPassword,
    createNewUserDocument,
    setDecryptionVerifyString,
    userData,
    getCurrentUserData,
    updateUserData,
    deleteUserDataWithKey,
    deleteAllUserData,
    deleteUserData
  } as const
}

export default useStorage
