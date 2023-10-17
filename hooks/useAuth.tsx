import { FirebaseError } from "firebase/app"
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut as signOutFromFirebase
} from "firebase/auth"
import { getDoc, doc } from "firebase/firestore"
import { useCallback } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import useStorage from "./useStorage"
import { FIRESTORE_USERDATA_COLLECTION_NAME } from "@/constants/Firestore"
import { db, auth } from "@/utils/firebase"
import { isDefined } from "@/utils/isDefined"

const useAuth = () => {
  const [user] = useAuthState(auth)
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

      /** 復号化検証用のテキストを初期データーとしてユーザーのコレクションを新規作成する */
      await createNewUserDocument(email, decryptionVerifyString)
    },
    [createNewUserDocument]
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        )

        createNewHashedPassword(password) // 渡されたパスワードをハッシュ化し、LocalStorageに保存、以後共通鍵として使う

        return userCredential
      } catch (e) {
        if (e instanceof FirebaseError) {
          // TODO: auth/user-not-found を使えばユーザーの存在確認できそうなのでFirestoreのドキュメントIDをメアドにする必要ない説
          switch (
            e.code // TODO: エラーコード対応拡充？？ (https://firebase.google.com/docs/reference/js/v8/firebase.FirebaseError#code)
          ) {
            case "auth/invalid-login-credentials":
              throw new Error(
                "サインインに失敗しました。パスワードが間違っている可能性があります。"
              )
            default:
              throw new Error("何らかの原因でサインインに失敗しました")
          }
        }
      }
    },
    [createNewHashedPassword]
  )

  const signOut = useCallback(async () => {
    await signOutFromFirebase(auth)
  }, [])

  return { checkUserExists, signUp, signIn, user, signOut } as const
}

export default useAuth
