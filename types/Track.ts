import { Provider } from "./Provider"

export type Track = {
  id: string
  provider: Provider
  title: string
  artist: string
  imgSrc: string
  imgHeight: number
  imgWidth: number
}
