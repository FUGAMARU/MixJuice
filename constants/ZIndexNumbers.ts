export const ZINDEX_NUMBERS = {
  VERCEL_SHAPE: -1, // 背景要素のコンテナ
  NOW_LOADING: 10, // ローディングアニメーション画面
  HEADER: 9, // ヘッダー
  NAVBAR_EXPANDED: 3, // ナビゲーションバー (常時表示されている場合)
  NAVBAR_COLLAPSED: 8, // ナビゲーションバー (ハンバーガーメニューによって表示/非表示を切り替えられる場合)
  NAVBAR_CHECKBOX_INNER: 2, // ナビゲーションバーにあるチェックボックスの四角いチェックする部分
  NAVBAR_CHECKBOX_LABEL_WRAPPER: 1, // ナビゲーションバーのラベルテキストのラッパー(コンテナ)
  ALBUM_ARTWORK: 1, // アルバムアートワークの画像とプレイヤーコントロール用のオーバーレイ (正方形の要素ひとかたまり)
  SEEKBAR_CONTAINER: 1 // シークバーのコンテナ
}
/** シークバーはCSSファイルでスタイリグしているため、シークバーのzIndexだけは"Player.module.css"にて管理
 * MantineのBoxコンポーネントを使用してシークバーを実装すると、再生位置が更新される度にheadタグ内にMantineが生成したstyleタグが追加されてしまうため
 * widthだけを更新したい場合はdivタグとCSSファイルで実装するしかない
 */
