import CryptoJS from "crypto-js"
import { setDoc, doc, getDoc, deleteField, updateDoc } from "firebase/firestore"
import { useCallback, useEffect, useMemo } from "react"

import { useAuthState } from "react-firebase-hooks/auth"
import { useRecoilState } from "recoil"
import useErrorModal from "./useErrorModal"
import { userDataAtom } from "@/atoms/userDataAtom"
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
  const { showError } = useErrorModal()
  const [userData, setUserData] = useRecoilState(userDataAtom)
  const [user, isLoadingUser] = useAuthState(auth)

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

  /** ユーザーデーターを扱う時はupdateUserDataと同じような書き方で統一したいのであえてクラスのGetterっぽくしている */
  const getUserData = useCallback(
    (key: UserDataKey) => userData?.[key],
    [userData]
  )

  const updateUserData = useCallback(
    async (key: UserDataKey, value: string) => {
      /** updateUserDataの使用箇所でupdateUserData自体をtry/catchしてしまうのが正しい実装なのだろうが、如何せん使用箇所が多くいちいちtry/cathcを書いているとコードが汚くなる気がするので例外処理はここで捌いてしまう */
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

        if (!isDefined(userData))
          throw new Error("ユーザーデーターがundefinedです")
        const updatedUserData = { ...userData, [key]: value }
        setUserData(updatedUserData)
      } catch (e) {
        showError(e)
      }
    },
    [
      encryptText,
      showError,
      user,
      decryptionVerifyString,
      userData,
      setUserData
    ]
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

        if (!isDefined(userData))
          throw new Error("ユーザーデーターがundefinedです")
        const updatedUserData = { ...userData }
        delete updatedUserData[key]
        setUserData(updatedUserData)
      } catch (e) {
        showError(e)
      }
    },
    [showError, user, userData, setUserData]
  )

  /** MixJuiceを起動した時にFirestoreのデーターをローカルのRecoilStateに取り込む */
  useEffect(() => {
    if (!initialize || !isDefined(user) || isLoadingUser) return
    ;(async () => {
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
          throw new Error(
            "データーの復号化検証に失敗しました。再ログインしてください。"
          ) // TODO: モーダルのボタン押したらログインフォームに飛ばされる独自例外に置き換える

        setUserData(decryptedUserData)
        console.log(
          "🟩DEBUG: Firestore上のユーザーデータをRecoilStateに取り込みました"
        )
      } catch (e) {
        showError(e)
      }
    })()
  }, [
    initialize,
    user,
    isLoadingUser,
    setUserData,
    showError,
    decryptText,
    decryptionVerifyString
  ])

  return {
    createNewHashedPassword,
    createNewUserDocument,
    getUserData,
    updateUserData,
    deleteUserData
  } as const
}

export default useStorage
