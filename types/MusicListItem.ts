import { Provider } from "./Provider"

export type MusicListItem = {
  id: string
  provider: Provider
  title: string
  artist: string
  imgSrc: string
}
