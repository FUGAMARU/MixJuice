import { getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const areAllEnvVarsSet = Object.values(firebaseConfig).every(
  val => typeof val === "string"
)
if (!areAllEnvVarsSet)
  throw new Error("Firebase用の環境変数が正しく設定されていません")

if (!getApps()?.length) initializeApp(firebaseConfig)

export const db = getFirestore()
export const auth = getAuth()
