import { Track } from "./Track"

export type Queue = Track & {
  playNext: boolean // 楽曲情報の右側のボタンを押下して手動でキューの先頭に移動させたかどうか
}
