import { Track } from "./Track"

export type MergedWebDAVSearchResult = {
  status:
    | "IDLE" // 初期状態、もしくはWebDAVサーバーの検索が完了したらこの状態になる
    | "SEARCHING_INDEXED_DB" // 検索が開始したらすぐにこの状態になる
    | "SEARCHING_WEBDAV_SERVER" // IndexedDBの検索が完了したらこの状態になる
  data: Track[]
}
