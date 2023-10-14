import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth"
import { getDoc, doc } from "firebase/firestore"
import { useCallback } from "react"
import useStorage from "./useStorage"
import { FIRESTORE_USERDATA_COLLECTION_NAME } from "@/constants/Firestore"
import { auth, db } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

const useAuth = () => {
  const { createNewHashedPassword, createNewUserDocument } = useStorage()

  const checkUserExists = useCallback(async (email: string) => {
    // fetchSignInMethodsForEmailを使っても空配列しか返ってこないのでFirestoreから該当UUIDのコレクションがあるかどうかで判定する
    const res = await getDoc(doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email))
    return res.exists()
  }, [])

  const signUp = useCallback(
    async (email: string, password: string) => {
      const decryptionVerifyString =
        process.env.NEXT_PUBLIC_DECRYPTION_VERIFY_STRING
      if (!isDefined(decryptionVerifyString))
        throw new Error(
          "データーの復号化検証に必要な環境変数 NEXT_PUBLIC_DECRYPTION_VERIFY_STRING が設定されていません"
        )

      /** Firebase Authに登録する */
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      /** メールアドレス認証メールを送信する */
      await sendEmailVerification(userCredential.user)

      /** パスワードをハッシュ化し、LocalStorageに保存、以後共通鍵として使う */
      createNewHashedPassword(password)

      /** 復号化検証用のテキストを初期データーとしてユーザーのコレクションを新規作成する */
      await createNewUserDocument(email, decryptionVerifyString)
    },
    [createNewHashedPassword, createNewUserDocument]
  )

  return { checkUserExists, signUp } as const
}

export default useAuth
