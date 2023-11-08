import { FirebaseError } from "firebase/app"
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut as signOutFromFirebase
} from "firebase/auth"
import { getDoc, doc } from "firebase/firestore"
import { useCallback } from "react"
import useStorage from "./useStorage"
import { FIRESTORE_USERDATA_COLLECTION_NAME } from "@/constants/Firestore"
import { db, auth } from "@/utils/firebase"

const useAuth = () => {
  const { createHashedPassword, createNewUserDocument } = useStorage({
    initialize: false
  })

  const checkUserExists = useCallback(async (email: string) => {
    // fetchSignInMethodsForEmailを使っても空配列しか返ってこないのでFirestoreから該当UUIDのコレクションがあるかどうかで判定する
    const res = await getDoc(doc(db, FIRESTORE_USERDATA_COLLECTION_NAME, email))
    return res.exists()
  }, [])

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        )

        createHashedPassword(password) // 渡されたパスワードをハッシュ化し、LocalStorageに保存、以後共通鍵として使う

        return userCredential
      } catch (e) {
        if (e instanceof FirebaseError) {
          switch (
            e.code // TODO: エラーコード対応拡充？？ (https://firebase.google.com/docs/reference/js/v8/firebase.FirebaseError#code)
          ) {
            case "auth/invalid-login-credentials":
              throw new Error(
                "サインインに失敗しました。パスワードが間違っている可能性があります。"
              )
            default:
              console.log("🟥ERROR: ", e)
              throw new Error("何らかの原因でサインインに失敗しました")
          }
        }
      }
    },
    [createHashedPassword]
  )

  const signOut = useCallback(async () => {
    await signOutFromFirebase(auth)
  }, [])

  const signUp = useCallback(
    async (email: string, password: string) => {
      /** Firebase Authに登録する */
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      /** メールアドレス認証メールを送信する */
      await sendEmailVerification(userCredential.user)

      /** 渡されたパスワードをハッシュ化し、LocalStorageに保存、以後共通鍵として使う */
      createHashedPassword(password)

      /** 復号化検証用のテキストを初期データーとしてユーザーのコレクションを新規作成する */
      await createNewUserDocument(email)
    },
    [createNewUserDocument, createHashedPassword]
  )

  return { checkUserExists, signUp, signIn, signOut } as const
}

export default useAuth
